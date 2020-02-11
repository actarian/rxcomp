const autoprefixer = require('gulp-autoprefixer'),
	babelPresetEnv = require('@babel/preset-env'),
	connect = require('gulp-connect'),
	cssnano = require('cssnano'),
	filter = require('gulp-filter'),
	gulpif = require('gulp-if'),
	htmlExtend = require('gulp-html-extend'),
	path = require('path'),
	plumber = require('gulp-plumber'),
	postcss = require('gulp-postcss'),
	rename = require('gulp-rename'),
	rollup = require('gulp-better-rollup'),
	scss = require('gulp-sass'),
	terser = require('gulp-terser'),
	rollupPluginBabel = require('rollup-plugin-babel'),
	rollupPluginCommonJs = require('@rollup/plugin-commonjs'),
	rollupPluginLicense = require('rollup-plugin-license'),
	rollupPluginNodeResolve = require('@rollup/plugin-node-resolve'),
	rollupPluginTypescript = require('@rollup/plugin-typescript');

const { dest, parallel, src, watch } = require('gulp');

const log = require('./logger');
const tfsCheckout = require('./tfs');

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
			return compileRollupJs_(config, item);
		});
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileRollupJs_(config, item) {
	const rollupInput = {
		plugins: [
			rollupPluginCommonJs(),
			rollupPluginBabel({
				presets: [
					[babelPresetEnv, { modules: false, loose: true }]
				],
				exclude: 'node_modules/**' // only transpile our source code
				// babelrc: false,
			}),
			rollupPluginLicense({
				banner: `@license <%= pkg.name %> v<%= pkg.version %>
				(c) <%= moment().format('YYYY') %> <%= pkg.author %>
				License: <%= pkg.license %>`,
			}),
		]
	};
	const rollupOutput = Object.assign({
			file: item.output,
			name: path.basename(item.output, '.js'),
			format: 'umd',
			globals: {},
			external: []
		},
		(item.rollup ? (item.rollup.output || {}) : {})
	);
	// console.log(rollupOutput);
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(plumber())
		.pipe(rollup(rollupInput, rollupOutput))
		.pipe(rename(item.output))
		.pipe(tfsCheckout(config))
		.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
		.pipe(filter('**/*.js'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpif(item.minify, terser()))
		.pipe(gulpif(item.minify, rename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(filter('**/*.js'))
		.pipe(connect.reload());
}

function compileTs_(config, done) {
	const items = compiles_(config, '.ts');
	const tasks = [];
	items.forEach(item => {
		tasks.push(function itemTask(done) {
			return compileRollupTs_(config, item);
		});
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileRollupTs_(config, item) {
	const rollupInput = {
		plugins: [
			rollupPluginTypescript({
				lib: ['es5', 'es6', 'dom'],
				target: 'es5',
				tsconfig: false,
			}),
			/*
			rollupPluginCommonJs(),
			rollupPluginBabel({
				presets: [
					[babelPresetEnv, { modules: false, loose: true }]
				],
				exclude: 'node_modules/**' // only transpile our source code
				// babelrc: false,
			}),
			*/
			rollupPluginLicense({
				banner: `@license <%= pkg.name %> v<%= pkg.version %>
				(c) <%= moment().format('YYYY') %> <%= pkg.author %>
				License: <%= pkg.license %>`,
			}),
		]
	};
	const rollupOutput = Object.assign({
			file: item.output,
			name: path.basename(item.output, '.js'),
			format: 'umd',
			globals: {},
			external: []
		},
		(item.rollup ? (item.rollup.output || {}) : {})
	);
	// console.log(rollupOutput);
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(plumber())
		.pipe(rollup(rollupInput, rollupOutput))
		.pipe(rename(item.output))
		.pipe(tfsCheckout(config))
		.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
		.pipe(filter('**/*.js'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpif(item.minify, terser()))
		.pipe(gulpif(item.minify, rename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpif(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(filter('**/*.js'))
		.pipe(connect.reload());
}

function compileHtml_(config, done) {
	const items = compiles_(config, '.html');
	const tasks = items.map(item => function itemTask() {
		return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
			.pipe(plumber())
			.pipe(htmlExtend({ annotations: true, verbose: false }))
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

function logWatch(path, stats) {
	log('Changed', path);
}

module.exports = {
	compileScss_,
	compileJs_,
	compileRollupJs_,
	compileTs_,
	compileHtml_,
	compilesGlobs_,
	compileWatcher_
};
