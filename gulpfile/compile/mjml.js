const path = require('path'),
	rollup = require('rollup'),
	rollupPluginMjml = require('rollup-plugin-mjml'),
	through2 = require('through2'),
	vinyl = require('vinyl');

const log = require('../logger/logger');

const { setEntry } = require('../watch/watch');

let rollupCache = new Map();

function mjml(item) {
	return through2.obj(function(file, enc, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			log.error('mjml', 'streaming not supported');
			return callback(null, file);
		}
		const inputOptions = mjmlInput(item, file.path);
		if (inputOptions.cache !== false) {
			inputOptions.cache = rollupCache.get(inputOptions.input);
		}
		const rollupGenerate = (bundle, output, i) => {
			return bundle.generate(output).then(result => {
				if (!result) {
					return;
				}
				const out = result.output.find(x => x.isAsset);
				const newFilePath = path.format({
					dir: path.dirname(output.file),
					name: path.basename(file.path, path.extname(file.path)),
					ext: '.html',
				});
				let targetFile;
				if (i > 0) {
					const newFile = new vinyl({
						cwd: file.cwd,
						base: file.base,
						path: newFilePath,
						stat: {
							isFile: () => true,
							isDirectory: () => false,
							isBlockDevice: () => false,
							isCharacterDevice: () => false,
							isSymbolicLink: () => false,
							isFIFO: () => false,
							isSocket: () => false
						}
					});
					targetFile = newFile;
				} else {
					file.path = newFilePath;
					targetFile = file;
				}
				targetFile.contents = Buffer.from(out.source);
				if (i > 0) {
					this.push(targetFile);
				}
				return result;
			}).catch(error => {
				log.error('mjml', error);
			});
		};
		rollup.rollup(inputOptions).then(bundle => {
				const outputs = mjmlOutput(item);
				if (inputOptions.cache !== false) {
					rollupCache.set(inputOptions.input, bundle);
				}
				return Promise.all(outputs.map((output, i) => rollupGenerate(bundle, output, i)));
			})
			.then((results) => {
				results.forEach(x => {
					const outputs = x.output;
					outputs.forEach(x => {
						setEntry(inputOptions.input, [inputOptions.input]);
					});
				});
				callback(null, file);
			})
			.catch(error => {
				log.error('mjml', error);
				if (inputOptions.cache !== false) {
					rollupCache.delete(inputOptions.input);
				}
				throw (error);
			});
	});
}

function mjmlInput(item, path) {
	const plugins = [
		rollupPluginMjml({
			keepComments: item.minify ? false : true,
			minify: item.minify ? true : false,
			beautify: item.minify ? false : true,
			// validationLevel: item.validationLevel || 'strict',
		}),
	].filter(x => x);
	const input = {
		input: path,
		plugins: plugins,
		cache: false,
	};
	return input;
}

function mjmlOutput(item) {
	const input = item.input;
	const output = item.output;
	const outputs = Array.isArray(output) ? output : [output];
	const default_ = {
		minify: item.minify || false,
	};
	return outputs.map(x => {
		let output = Object.assign({}, default_);
		if (typeof x === 'string') {
			output.file = x;
		} else if (typeof x === 'object') {
			output = Object.assign(output, x);
		}
		return output;
	});
}

module.exports = {
	mjml,
	mjmlInput,
	mjmlOutput,
};
