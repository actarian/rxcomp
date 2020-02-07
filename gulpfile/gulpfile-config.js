const { parallel, series } = require('gulp');
const { compileScss_, compileJs_, compileTs_, compileHtml_, compileWatcher_ } = require('./compile');
const { bundleCss_, bundleJs_, bundleResource_, bundleWatcher_ } = require('./bundle');
const { serve_ } = require('./serve');
const { getConfig, configWatcher_ } = require('./config');

let config = getConfig();

// COMPILERS
function compileScss(done) {
	return compileScss_(config, done);
}

function compileJs(done) {
	return compileJs_(config, done);
}

function compileTs(done) {
	return compileTs_(config, done);
}

function compileHtml(done) {
	return compileHtml_(config, done);
}

const compileTask = parallel(compileScss, compileJs, compileTs, compileHtml); // compilePartials, compileSnippets

// BUNDLERS
function bundleCss(done) {
	return bundleCss_(config, done);
}

function bundleJs(done) {
	return bundleJs_(config, done);
}

function bundleResource(done) {
	return bundleResource_(config, done);
}

const bundleTask = parallel(bundleCss, bundleJs, bundleResource);

// WATCH
let watchers = [];

function watchTask(done) {
	while (watchers.length) {
		const w = watchers.shift();
		if (typeof w.close === 'function') {
			w.close();
		}
	}
	const compileWatcher = compileWatcher_(config);
	const bundleWatcher = bundleWatcher_(config);
	const configWatcher = configWatcher_(function(done) {
		return series(compileTask, bundleTask, watchTask)(done);
	});
	watchers = [].concat(compileWatcher, bundleWatcher, configWatcher);
	done();
}

// SERVE
function serveTask(done) {
	return serve_(config, done);
}

// UTILS
/*
function watchAll() {
	watch(['***.*', '!node_modules***.*'], function watch(done) {
		done();
	}).on('change', (path) => {
		logWatch(...arguments);
	});
}

function logWatch(path, stats) {
	log('Changed', path);
}
*/

exports.compile = compileTask;
exports.bundle = bundleTask;
exports.watch = watchTask;
exports.serve = serveTask;
exports.build = series(compileTask, bundleTask);
exports.buildAndWatch = series(compileTask, bundleTask, watchTask);
exports.buildWatchAndServe = series(compileTask, bundleTask, watchTask, serveTask);
