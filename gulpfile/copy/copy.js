const gulpIf = require('gulp-if'),
	gulpPlumber = require('gulp-plumber'),
	gulpRename = require('gulp-rename');

const { dest, parallel, src, watch } = require('gulp');

const log = require('../logger/logger');
const { service } = require('../config/config');
const tfsCheckout = require('../tfs/tfs');
const { setEntry } = require('../watch/watch');

function copy(item, ext, done) {
	// console.log('copy', ext, item);
	let task;
	switch (ext) {
		default:
			task = copyItemTask(item);
	}
	return task ? task : (typeof done === 'function' ? done() : null);
}

function copyTask(done) {
	const items = copies(service.config);
	const tasks = items.map(item => function copy(done) {
		return copyItemTask(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function copyItemTask(item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: false })
		.pipe(gulpPlumber())
		.pipe(gulpRename({ dirname: item.output }))
		.pipe(gulpIf(!skip, dest('.')))
		.pipe(tfsCheckout(skip))
		.on('end', () => log('Bundle', item.output));
}

function copies() {
	if (service.config) {
		return service.config.copy || [];
	} else {
		return [];
	}
}

module.exports = {
	copy,
	copyTask,
	copyItemTask,
	copies,
};
