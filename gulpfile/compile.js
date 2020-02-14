const autoprefixer = require('gulp-autoprefixer'),
	connect = require('gulp-connect'),
	cssnano = require('cssnano'),
	filter = require('gulp-filter'),
	gulpif = require('gulp-if'),
	htmlExtend = require('gulp-html-extend'),
	htmlmin = require('gulp-htmlmin'),
	plumber = require('gulp-plumber'),
	postcss = require('gulp-postcss'),
	rename = require('gulp-rename'),
	scss = require('gulp-sass'),
	terser = require('gulp-terser');

const { dest, parallel, src, watch } = require('gulp');

const log = require('./logger');
const tfsCheckout = require('./tfs');

const { rollup_, rollupInput_, rollupOutput_ } = require('./rollup');
const { typescript_, typescriptInput_, typescriptOutput_ } = require('./typescript');

// COMPILERS
function compileScss_(config, done) {
	const items = compiles_(config, '.scss');
	const tasks = items.map(item => function itemTask() {
		const plugins = [
			// autoprefixer({browsers: ['last 1 version']}),
			cssnano()
		];
		return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
			.pipe(plumber())
			.pipe(scss({
				includePaths: ['./node_modules/', __dirname + '/node_modules', 'node_modules'],
			}).on('compile:scss.error', (error) => {
				log.error('compile:scss', error);
			}))
			.pipe(autoprefixer())
			.pipe(rename(item.output))
			.pipe(tfsCheckout(config))
			.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
			.pipe(filter('**/*.css'))
			.on('end', () => log('Compile', item.output))
			.pipe(gulpif(item.minify, postcss(plugins)))
			.pipe(gulpif(item.minify, rename({ extname: '.min.css' })))
			.pipe(tfsCheckout(config, !item.minify))
			.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
			.pipe(filter('**/*.css'))
			.pipe(connect.reload());
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileJs_(config, done) {
	const items = compiles_(config, '.js');
	const tasks = [];
	items.forEach(item => {
		tasks.push(function itemTask(done) {
			return compileRollup_(config, item);
		});
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileTs_(config, done) {
	const items = compiles_(config, '.ts');
	const tasks = [];
	items.forEach(item => {
		tasks.push(function itemTask(done) {
			return compileTypescript_(config, item);
		});
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileRollup_(config, item) {
	const outputs = rollupOutput_(item.input, item.output);
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(plumber())
		.pipe(rollup_(config, item))
		// .pipe(rename(item.output))
		.pipe(tfsCheckout(config))
		.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
		.pipe(filter('**/*.js'))
		.on('end', () => log('Compile', outputs.map(x => x.file).join(', ')))
		.pipe(gulpif(item.minify, terser()))
		.pipe(gulpif(item.minify, rename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(filter('**/*.js'))
		.pipe(connect.reload());
}

function compileTypescript_(config, item) {
	const outputs = rollupOutput_(item.input, item.output);
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(plumber())
		.pipe(typescript_(config, item))
		/*
		// .pipe(rename(item.output))
		.pipe(tfsCheckout(config))
		.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
		*/
		.pipe(filter('**/*.js'))
		.on('end', () => log('Compile', outputs.map(x => x.file).join(', ')))
		/*
		.pipe(gulpif(item.minify, terser()))
		.pipe(gulpif(item.minify, rename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
		*/
		.pipe(filter('**/*.js'))
		.pipe(connect.reload());
}

function compileHtml_(config, done) {
	const items = compiles_(config, '.html');
	const tasks = items.map(item => function itemTask() {
		return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
			.pipe(plumber())
			.pipe(htmlExtend({ annotations: true, verbose: false }))
			.pipe(gulpif(item.minify, htmlmin({ collapseWhitespace: true })))
			.pipe(rename(function(path) {
				return {
					dirname: item.output,
					basename: path.basename,
					extname: path.extname,
				};
			}))
			.pipe(tfsCheckout(config))
			.pipe(dest('.'))
			.on('end', () => log('Compile', item.output))
			.pipe(connect.reload());
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compilesGlobs_(config, ext) {
	return compiles_(config, ext).map(x => {
		return x.input.replace(/\/[^\/]*$/, '/**/*' + ext);
	});
}

function compiles_(config, ext) {
	if (config) {
		return config.target.compile.filter((item) => {
			return new RegExp(`${ext}$`).test(item.input);
		});
	} else {
		return [];
	}
}

function compileWatcher_(config) {
	const scss = watch(compilesGlobs_(config, '.scss'), function compileScss(done) {
		compileScss_(config, done);
	}).on('change', logWatch);
	const js = watch(compilesGlobs_(config, '.js'), function compileJs(done) {
		compileJs_(config, done);
	}).on('change', logWatch);
	const ts = watch(compilesGlobs_(config, '.ts'), function compileTs(done) {
		compileTs_(config, done);
	}).on('change', logWatch);
	const html = watch(compilesGlobs_(config, '.html'), function compileScss(done) {
		compileHtml_(config, done);
	}).on('change', logWatch);
	return [scss, js, ts, html];
}

function compileCssWatcher_(config) {
	const scss = watch(compilesGlobs_(config, '.scss'), function compileScss(done) {
		compileScss_(config, done);
	}).on('change', logWatch);
	return [scss];
}

function compileJsWatcher_(config) {
	const js = watch(compilesGlobs_(config, '.js'), function compileJs(done) {
		compileJs_(config, done);
	}).on('change', logWatch);
	const ts = watch(compilesGlobs_(config, '.ts'), function compileTs(done) {
		compileTs_(config, done);
	}).on('change', logWatch);
	return [js, ts];
}

function logWatch(path, stats) {
	log('Changed', path);
}

module.exports = {
	compileScss_,
	compileJs_,
	compileTs_,
	compileHtml_,
	compilesGlobs_,
	compileWatcher_,
	compileCssWatcher_,
	compileJsWatcher_
};
