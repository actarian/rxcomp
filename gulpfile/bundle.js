const concat = require('gulp-concat'),
	cssnano = require('cssnano'),
	filter = require('gulp-filter'),
	gulpif = require('gulp-if'),
	plumber = require('gulp-plumber'),
	postcss = require('gulp-postcss'),
	rename = require('gulp-rename'),
	terser = require('gulp-terser');

const { dest, parallel, src, watch } = require('gulp');

const log = require('./logger');
const tfsCheckout = require('./tfs');

// BUNDLE CSS
function bundleCss_(config, done) {
	const items = bundles_(config, '.css');
	const tasks = items.map(item => function itemTask(done) {
		return bundleCssItem_(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleCssItem_(config, item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	const plugins = [
		// autoprefixer({browsers: ['last 1 version']}),
		cssnano()
	];
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(plumber())
		.pipe(gulpif(!skip, concat(item.output)))
		.pipe(tfsCheckout(config, skip))
		.pipe(gulpif(!skip, dest('.')))
		.on('end', () => log('Bundle', item.output))
		.pipe(gulpif(item.minify, postcss(plugins)))
		.pipe(gulpif(item.minify, rename({ extname: '.min.css' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(filter('**/*.css'));
}

// BUNDLE JS
function bundleJs_(config, done) {
	const items = bundles_(config, '.js');
	const tasks = items.map(item => function itemTask(done) {
		return bundleJsItem_(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleJsItem_(config, item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(plumber())
		.pipe(gulpif(!skip, concat(item.output)))
		.pipe(tfsCheckout(config, skip))
		.pipe(gulpif(!skip, dest('.')))
		.on('end', () => log('Bundle', item.output))
		.pipe(gulpif(item.minify, terser()))
		.pipe(gulpif(item.minify, rename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(filter('**/*.js'));
}

// BUNDLE RESOURCE
function bundleResource_(config, done) {
	const items = resources_(config);
	const tasks = items.map(item => function itemTask(done) {
		return bundleResourceItem_(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleResourceItem_(config, item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: false })
		.pipe(plumber())
		.pipe(rename({ dirname: item.output }))
		.pipe(gulpif(!skip, dest('.')))
		.pipe(tfsCheckout(config, skip))
		.on('end', () => log('Bundle', item.output));
}

function bundles_(config, ext) {
	if (config.target) {
		return config.target.bundle.filter((item) => {
			if (ext && item.output) {
				return new RegExp(`${ext}$`).test(item.output);
			} else {
				return ext === 'resource' && !item.output;
			}
		});
	} else {
		return [];
	}
}

function resources_(config) {
	if (config.target) {
		return config.target.resource || [];
	} else {
		return [];
	}
}

function bundleWatcher_(config) {
	const css = bundles_(config, '.css').map((item) => {
		return watch(item.input, function bundleCss_(done) {
			return bundleCssItem_(config, item);
		}).on('change', logWatch);
	});
	const js = bundles_(config, '.js').map((item) => {
		return watch(item.input, function bundleJs_(done) {
			return bundleJsItem_(config, item);
		}).on('change', logWatch);
	});
	const resource = resources_(config).map((item) => {
		return watch(item.input, function bundleResource_(done) {
			return bundleResourceItem_(config, item);
		}).on('change', logWatch);
	});
	return [css, js, resource];
}

function bundleCssWatcher_(config) {
	const css = bundles_(config, '.css').map((item) => {
		return watch(item.input, function bundleCss_(done) {
			return bundleCssItem_(config, item);
		}).on('change', logWatch);
	});
	return [css];
}

function bundleJsWatcher_(config) {
	const js = bundles_(config, '.js').map((item) => {
		return watch(item.input, function bundleJs_(done) {
			return bundleJsItem_(config, item);
		}).on('change', logWatch);
	});
	return [js];
}

function logWatch(path, stats) {
	log('Changed', path);
}

module.exports = {
	bundleCss_,
	bundleCssItem_,
	bundleJs_,
	bundleJsItem_,
	bundleResource_,
	bundleResourceItem_,
	bundles_,
	resources_,
	bundleWatcher_,
	bundleCssWatcher_,
	bundleJsWatcher_
};
