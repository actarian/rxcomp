const cssnano = require('cssnano'),
	gulpAutoprefixer = require('gulp-autoprefixer'),
	gulpConnect = require('gulp-connect'),
	gulpFilter = require('gulp-filter'),
	gulpHtmlExtend = require('gulp-html-extend'),
	gulpHtmlMin = require('gulp-htmlmin'),
	gulpIf = require('gulp-if'),
	gulpPlumber = require('gulp-plumber'),
	gulpPostcss = require('gulp-postcss'),
	gulpRename = require('gulp-rename'),
	gulpTerser = require('gulp-terser'),
	path = require('path');

const { dest, parallel, series, src, watch } = require('gulp');

const { setEntry } = require('../watch/watch');

const log = require('../logger/logger');
const { service } = require('../config/config');
const tfsCheckout = require('../tfs/tfs');
const { sass } = require('./sass');
const { mjml } = require('./mjml');

const { rollup, rollupInput, rollupOutput } = require('./rollup');
const { typescript, typescriptInput, typescriptOutput } = require('./typescript');

function compile(item, ext, done) {
	// console.log('compile', ext, item);
	let task;
	switch (ext) {
		case '.scss':
			task = compileScssItem(item);
			break;
		case '.js':
		case '.mjs':
			task = compileJsItem(item);
			break;
		case '.ts':
		case '.tsx':
			task = compileTsItem(item);
			break;
		case '.html':
			task = compileHtmlItem(item);
			break;
		case '.mjml':
			task = compileMjmlItem(item);
			break;
	}
	return task ? task : (typeof done === 'function' ? done() : null);
}

function compileScss(done) {
	const items = compiles('.scss');
	const tasks = items.map(item => function compileScss() {
		return compileScssItem(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileScssItem(item) {
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(sass({
			includePaths: ['./node_modules/', __dirname + '/node_modules', 'node_modules'],
		}).on('compile:scss.error', (error) => {
			log.error('compile:scss', error);
		}))
		.pipe(gulpAutoprefixer())
		.pipe(gulpRename(item.output))
		.pipe(tfsCheckout())
		.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
		.pipe(gulpFilter('**/*.css'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpIf(item.minify, gulpPostcss([
			// gulpAutoprefixer({browsers: ['last 1 version']}),
			cssnano()
		])))
		.pipe(gulpIf(item.minify, gulpRename({ extname: '.min.css' })))
		.pipe(tfsCheckout(!item.minify))
		.pipe(gulpIf(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.css'))
		.pipe(gulpConnect.reload());
}

function compileJs(done) {
	const items = compiles('.js', '.mjs');
	const tasks = items.map(item => function compileJs(done) {
		return compileJsItem(item, done);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileJsItem(item, done) {
	const tasks = [];
	const outputs = rollupOutput(item);
	outputs.forEach((output, i) => {
		tasks.push(function compileJsItem(done) {
			const item_ = Object.assign({}, item, { output });
			return compileRollup(item_);
		});
	});
	return tasks.length ? series(...tasks)(done) : done();
}

function compileTs(done) {
	const items = compiles('.ts', '.tsx');
	const tasks = items.map(item => function compileTs(done) {
		return compileTsItem(item, done);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileTsItem(item, done) {
	const tasks = [];
	const outputs = typescriptOutput(item);
	outputs.forEach((output, i) => {
		tasks.push(function compileTsItem(done) {
			const item_ = Object.assign({}, item, { output });
			const output_ = typescriptOutput(item_)[0];
			let task;
			switch (output_.format) {
				case 'iife':
				case 'umd':
					task = compileRollup(item_);
					break;
				default:
					task = compileTypescript(item_);
			}
			return task;
		});
	});
	return tasks.length ? series(...tasks)(done) : done();
}

function compileHtml(done) {
	const items = compiles('.html');
	const tasks = items.map(item => function compileHtml() {
		return compileHtmlItem(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileHtmlItem(item) {
	setEntry(item.input, path.extname(item.input));
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(gulpHtmlExtend({ annotations: true, verbose: false }))
		.pipe(gulpIf(item.minify, gulpHtmlMin({ collapseWhitespace: true })))
		.pipe(gulpRename(function(path) {
			return {
				dirname: item.output,
				basename: path.basename,
				extname: path.extname,
			};
		}))
		.pipe(tfsCheckout())
		.pipe(dest('.'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpConnect.reload());
}

function compileMjml(done) {
	const items = compiles('.mjml');
	const tasks = items.map(item => function compileMjml() {
		return compileMjmlItem(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileMjmlItem(item) {
	setEntry(item.input, path.extname(item.input));
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(mjml(item))
		.pipe(gulpRename(function(path) {
			return {
				dirname: item.output,
				basename: path.basename,
				extname: path.extname,
			};
		}))
		.pipe(tfsCheckout())
		.pipe(dest('.'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpConnect.reload());
}

function compileRollup(item) {
	const outputs = rollupOutput(item);
	const minify = outputs[0].minify || item.minify;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(rollup(item))
		/*
		.pipe(gulpRename(function(file) {
			const output = outputs.find(x => {
				// console.log('file', x.file, file.basename, x.file.indexOf(file.basename));
				return x.file.indexOf(file.basename) !== -1;
			});
			file.dirname = path.dirname(output.file);
		}))
		*/
		.pipe(tfsCheckout())
		.pipe(dest('.', minify ? null : { sourcemaps: '.' }))
		.pipe(gulpFilter('**/*.js'))
		.on('end', () => log('Compile', outputs.map(x => x.file).join(', ')))
		.pipe(gulpIf(minify, gulpTerser()))
		.pipe(gulpIf(minify, gulpRename({ extname: '.min.js' })))
		.pipe(tfsCheckout(!minify))
		.pipe(gulpIf(minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.js'))
		.pipe(gulpConnect.reload());
}

function compileTypescript(item) {
	const outputs = typescriptOutput(item);
	const minify = outputs[0].minify || item.minify;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(typescript(item))
		/*
		// .pipe(gulpRename(item.output))
		.pipe(tfsCheckout())
		.pipe(dest('.', minify ? null : { sourcemaps: '.' }))
		*/
		.pipe(gulpFilter('**/*.js'))
		.on('end', () => log('Compile', outputs.map(x => x.file).join(', ')))
		/*
		.pipe(gulpIf(minify, gulpTerser()))
		.pipe(gulpIf(minify, gulpRename({ extname: '.min.js' })))
		.pipe(tfsCheckout(!minify))
		.pipe(gulpIf(minify, dest('.', { sourcemaps: '.' })))
		*/
		.pipe(gulpFilter('**/*.js'))
		.pipe(gulpConnect.reload());
}

function compiles(...args) {
	if (service.config) {
		return service.config.compile.filter((item) => {
			return new RegExp(`${args.join('|')}$`).test(item.input);
		});
	} else {
		return [];
	}
}

function globs(ext) {
	return compiles(ext).map(x => {
		return x.input.replace(/\/[^\/]*$/, '/**/*' + ext);
	});
}

module.exports = {
	compile,
	compileScss,
	compileScssItem,
	compileJs,
	compileJsItem,
	compileTs,
	compileTsItem,
	compileHtml,
	compileMjml,
	compileMjmlItem,
};

/*
'iife': 'iife', // A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.)
'umd': 'umd', // Universal Module Definition, works as amd, cjs and iife all in one
'amd': 'amd', // Asynchronous Module Definition, used with module loaders like RequireJS
'cjs': 'cjs', // CommonJS, suitable for Node and other bundlers
'esm': 'esm', // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
'system': 'system', // Native format of the SystemJS loader
*/
