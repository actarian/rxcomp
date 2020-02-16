const fs = require('fs'),
	path = require('path'),
	process = require('process');

const log = require('./logger');

function getObject_(file, objectDefault = {}, objectOverride = {}) {
	let object = extendObject_({}, objectDefault);
	if (fs.existsSync(file)) {
		const text = fs.readFileSync(file, 'utf8');
		const objectJson = JSON.parse(stripBom_(text));
		object = extendObject_(object, objectJson);
	} else {
		log.warn(`missing ${file}`);
	}
	object = extendObject_(object, objectOverride);
	return object;
}

function stripBom_(text) {
	text = text.toString();
	if (text.charCodeAt(0) === 0xFEFF) {
		text = text.slice(1);
	}
	return text;
}

function extendObject_(a, b) {
	if (typeof a === 'object') {
		for (let key in b) {
			if (typeof a[key] === 'object' && typeof b[key] === 'object') {
				a[key] = extendObject_(a[key], b[key]);
			} else {
				a[key] = b[key];
			}
		}
		return a;
	} else {
		return b;
	}
}

module.exports = {
	getObject: getObject_,
	extend: extendObject_,
};
