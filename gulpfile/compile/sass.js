const nodeSass = require('node-sass'),
	path = require('path'),
	through2 = require('through2'),
	vinyl = require('vinyl'),
	vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

const log = require('../logger/logger');
const { service } = require('../config/config');

const { setEntry } = require('../watch/watch');

function sass(options, sync) {
	options = Object.assign({}, options);
	return through2.obj(function(file, enc, callback) { // eslint-disable-line consistent-return
		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			log.error('sass', 'streaming not supported');
			return callback(null, file);
		}
		const input = file.path;
		if (path.basename(file.path).indexOf('_') === 0) {
			return callback();
		}
		if (!file.contents.length) {
			file.path = replaceExtension(file.path, '.css'); // eslint-disable-line no-param-reassign
			return callback(null, file);
		}
		options.data = file.contents.toString();
		// we set the file path here so that libsass can correctly resolve import paths
		options.file = file.path;
		// Ensure `indentedSyntax` is true if a `.sass` file
		if (path.extname(file.path) === '.sass') {
			options.indentedSyntax = true;
		}
		// Ensure file's parent directory in the include path
		if (options.includePaths) {
			if (typeof options.includePaths === 'string') {
				options.includePaths = [options.includePaths];
			}
		} else {
			options.includePaths = [];
		}
		options.includePaths.unshift(path.dirname(file.path));
		// Generate Source Maps if plugin source-map present
		if (file.sourceMap) {
			options.sourceMap = file.path;
			options.omitSourceMapUrl = true;
			options.sourceMapContents = true;
		}
		const filePush = (sassObj) => {
			let sassMap;
			let sassMapFile;
			let sassFileSrc;
			let sassFileSrcPath;
			let sourceFileIndex;
			// Build Source Maps!
			if (sassObj.map) {
				// Transform map into JSON
				sassMap = JSON.parse(sassObj.map.toString());
				// Grab the stdout and transform it into stdin
				sassMapFile = sassMap.file.replace(/^stdout$/, 'stdin');
				// Grab the base file name that's being worked on
				sassFileSrc = file.relative;
				// Grab the path portion of the file that's being worked on
				sassFileSrcPath = path.dirname(sassFileSrc);
				if (sassFileSrcPath) {
					// Prepend the path to all files in the sources array except the file that's being worked on
					sourceFileIndex = sassMap.sources.indexOf(sassMapFile);
					sassMap.sources = sassMap.sources.map((source, index) => { // eslint-disable-line arrow-body-style
						return index === sourceFileIndex ? source : path.join(sassFileSrcPath, source);
					});
				}
				// Remove 'stdin' from souces and replace with filenames!
				sassMap.sources = sassMap.sources.filter(src => src !== 'stdin' && src);
				// Replace the map file with the original file name (but new extension)
				sassMap.file = replaceExtension(sassFileSrc, '.css');
				// Apply the map
				vinylSourcemapsApply(file, sassMap);
			}
			file.contents = sassObj.css; // eslint-disable-line no-param-reassign
			file.path = replaceExtension(file.path, '.css'); // eslint-disable-line no-param-reassign
			callback(null, file);
		};
		if (sync !== true) {
			const callback = (error, object) => { // eslint-disable-line consistent-return
				if (error) {
					return log.error('sass', error);
					// return callback(null, null);
				}
				setEntry(input, object.stats.includedFiles);
				filePush(object);
			};
			nodeSass.render(options, callback);
		} else {
			try {
				const object = nodeSass.renderSync(options);
				setEntry(input, object.stats.includedFiles);
				filePush(object);
			} catch (error) {
				return log.error('sass', error);
				// return callback(null, null);
			}
		}
	});
}

sass.sync = (options) => sass(options, true);

function replaceExtension(filePath, ext) {
	filePath = path.format({
		dir: path.dirname(filePath),
		name: path.basename(filePath, path.extname(filePath)),
		ext,
	});
	return filePath;
}

/*

const errorM = (error) => {
	const filePath = (error.file === 'stdin' ? file.path : error.file) || file.path;
	const relativePath = path.relative(process.cwd(), filePath);
	const message = [chalk.underline(relativePath), error.formatted].join('\n');

	error.messageFormatted = message; // eslint-disable-line no-param-reassign
	error.messageOriginal = error.message; // eslint-disable-line no-param-reassign
	error.message = stripAnsi(message); // eslint-disable-line no-param-reassign
	error.relativePath = relativePath; // eslint-disable-line no-param-reassign

	return callback(new pluginError('sass', error));
};

sass.logError = function logError(error) {
	const message = new pluginError('sass', error.messageFormatted).toString();
	process.stderr.write(`${message}\n`);
	this.emit('end');
};
*/

module.exports = {
	sass
};
