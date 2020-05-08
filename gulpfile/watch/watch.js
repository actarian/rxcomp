const path = require('path');
const { watch } = require('gulp');

const log = require('../logger/logger');
const entries = {};
const cwd = process.cwd();

let watcher;

function watchEntries(callback) {
	if (watcher && typeof watcher.close === 'function') {
		watcher.close();
	}
	watcher = watch(['**/*.*', '!node_modules/**/*.*']).on('change', (path_) => {
		const matchedEntries = Object.keys(entries).filter(key => {
			const imports = entries[key];
			if (isGlob(key)) {
				return isExt(path_, imports) && sameRoot(path_, key);
			} else if (isPath(imports)) {
				return matchPaths(key, path_);
			} else {
				const found = imports.find(i => {
					// console.log(i, path_);
					return matchPaths(i, path_);
				}) || matchPaths(key, path_);
				return found;
			}
		});
		if (matchedEntries.length) {
			if (typeof callback === 'function') {
				setTimeout(() => {
					matchedEntries.forEach(entry => callback(path_, entry));
				}, 1);
			}
		}
	});
}

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

function matchPaths(p1, p2) {
	return path.normalize(p1).indexOf(path.normalize(p2)) !== -1;
}

module.exports = {
	watchEntries,
	setEntry,
	isGlob,
	isPath,
	isExt,
	sameRoot,
	matchPaths
};
