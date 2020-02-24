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
	// console.log('bundle', ext, item);
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

// BUNDLE CSS
function bundleCss(done) {
	const items = bundles('.css');
	const tasks = items.map(item => function itemTask(done) {
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

// BUNDLE JS
function bundleJs(done) {
	// console.log('service', service, service.config.bundle[0]);
	const items = bundles('.js');
	const tasks = items.map(item => function itemTask(done) {
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

/*
function bundleWatcher(config) {
	const css = bundles('.css').map((item) => {
		return watch(item.input, function bundleCss_(done) {
			return bundleCssItem(item);
		}).on('change', logWatch);
	});
	const js = bundles('.js').map((item) => {
		return watch(item.input, function bundleJs_(done) {
			return bundleJsItem(item);
		}).on('change', logWatch);
	});
	return [css, js];
}

function bundleCssWatcher(config) {
	const css = bundles('.css').map((item) => {
		return watch(item.input, function bundleCss_(done) {
			return bundleCssItem(item);
		}).on('change', logWatch);
	});
	return [css];
}

function bundleJsWatcher(config) {
	const js = bundles('.js').map((item) => {
		return watch(item.input, function bundleJs_(done) {
			return bundleJsItem(item);
		}).on('change', logWatch);
	});
	return [js];
}

function logWatch(path, stats) {
	log('Changed', path);
}
*/

function bundles(ext) {
	if (service.config) {
		return service.config.bundle.filter((item) => {
			return new RegExp(`${ext}$`).test(item.output);
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
