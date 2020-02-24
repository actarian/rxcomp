const path = require('path');
const { watch } = require('gulp');

const log = require('../logger/logger');
const entries = {};
const cwd = process.cwd();

function setEntry(entry, imports) {
	// console.log(entry, imports);
	entry = entry.replace(cwd, '');
	if (typeof imports === 'string') {
		//
		entries[entry] = imports;
	} else if (imports) {
		imports = Array.isArray(imports) ? imports : [imports];
		imports = imports.map(x => x.replace(cwd, ''));
		entries[entry] = imports;
	}
	// log('watch', entry, imports);
}

let watcher;

function watchEntries(callback) {
	if (watcher && typeof watcher.close === 'function') {
		watcher.close();
	}
	let complete;
	watcher = watch(['**/*.*', '!node_modules/**/*.*'], function watch(done) {
		complete = done;
		// console.log('done');
	}).on('change', (path_) => {
		const entry = Object.keys(entries).reduce((p, key) => {
			const imports = entries[key];
			if (isGlob(key)) {
				if (isExt(path_, imports) && sameRoot(path_, key)) {
					return key;
				} else {
					return p;
				}
			} else if (isPath(imports)) {
				if (key.indexOf(path_) !== -1) {
					return key;
				} else {
					return p;
				}
			} else {
				const found = imports.find(i => {
					// console.log(i, path_);
					return i.indexOf(path_) !== -1;
				}) || key.indexOf(path_) !== -1;
				if (found) {
					return key;
				} else {
					return p;
				}
			}
		}, null);
		if (entry) {
			// console.log('entry', entry);
			// log('watch.changed', path_, '>', entry);
			if (typeof callback === 'function') {
				callback(path_, entry, complete);
			}
		} else {
			if (typeof complete === 'function') {
				return complete();
			}
			// console.log('change');
		}
	});
}

function isGlob(path) {
	return typeof path === 'string' && path.indexOf('*') !== -1;
}

function isPath(path) {
	return typeof path === 'string' && path.indexOf('*') === -1;
}

function isExt(p1, ext) {
	return path.extname(p1) === ext;
}

function sameRoot(p1, p2) {
	return path.dirname(p1).indexOf(path.dirname(p2)) === 0;
}

module.exports = {
	setEntry,
	watchEntries
};
