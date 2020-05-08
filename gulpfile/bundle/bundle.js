const cssnano = require('cssnano'),
	gulpFilter = require('gulp-filter'),
	gulpIf = require('gulp-if'),
	gulpPlumber = require('gulp-plumber'),
	gulpPostcss = require('gulp-postcss'),
	gulpRename = require('gulp-rename'),
	gulpTerser = require('gulp-terser'),
	gulpConcat = require('gulp-concat');

const { dest, parallel, src, watch } = require('gulp');

const log = require('../logger/logger');
const { service } = require('../config/config');
const tfsCheckout = require('../tfs/tfs');
const { setEntry } = require('../watch/watch');

function bundle(item, ext, done) {
	let task;
	switch (ext) {
		case '.scss':
			task = bundleCssItem(item);
			break;
		case '.js':
			task = bundleJsItem(item);
			break;
	}
	return task ? task : (typeof done === 'function' ? done() : null);
}

function bundleCss(done) {
	const items = bundles('.css');
	const tasks = items.map(item => function bundleCss(done) {
		setEntry(item.output, Array.isArray(item.input) ? item.input : [item.input]);
		return bundleCssItem(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleCssItem(item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	const plugins = [
		// autoprefixer({browsers: ['last 1 version']}),
		cssnano()
	];
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(gulpIf(!skip, gulpConcat(item.output)))
		.pipe(tfsCheckout(skip))
		.pipe(gulpIf(!skip, dest('.')))
		.on('end', () => log('Bundle', item.output))
		.pipe(gulpIf(item.minify, gulpPostcss(plugins)))
		.pipe(gulpIf(item.minify, gulpRename({ extname: '.min.css' })))
		.pipe(tfsCheckout(!item.minify))
		.pipe(gulpIf(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.css'));
}

function bundleJs(done) {
	const items = bundles('.js');
	const tasks = items.map(item => function bundleJs(done) {
		setEntry(item.output, Array.isArray(item.input) ? item.input : [item.input]);
		return bundleJsItem(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleJsItem(item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(gulpIf(!skip, gulpConcat(item.output)))
		.pipe(tfsCheckout(skip))
		.pipe(gulpIf(!skip, dest('.')))
		.on('end', () => log('Bundle', item.output))
		.pipe(gulpIf(item.minify, gulpTerser()))
		.pipe(gulpIf(item.minify, gulpRename({ extname: '.min.js' })))
		.pipe(tfsCheckout(!item.minify))
		.pipe(gulpIf(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.js'));
}

function bundles(...args) {
	if (service.config) {
		return service.config.bundle.filter((item) => {
			return args.find(ext => item.output.lastIndexOf(ext) === item.output.length - ext.length) !== undefined;
		});
	} else {
		return [];
	}
}

module.exports = {
	bundle,
	bundleCss,
	bundleCssItem,
	bundleJs,
	bundleJsItem,
	bundles,
};
