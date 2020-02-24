const fs = require('fs'),
	path = require('path'),
	process = require('process');

const log = require('../logger/logger');

function getObject(file, objectDefault = {}, objectOverride = {}) {
	let object = extendObject({}, objectDefault);
	if (fs.existsSync(file)) {
		const text = fs.readFileSync(file, 'utf8');
		const objectJson = JSON.parse(stripBom(text));
		object = extendObject(object, objectJson);
	} else {
		log.warn(`missing ${file}`);
	}
	object = extendObject(object, objectOverride);
	return object;
}

function stripBom(text) {
	text = text.toString();
	if (text.charCodeAt(0) === 0xFEFF) {
		text = text.slice(1);
	}
	return text;
}

function extendObject(a, b) {
	if (typeof a === 'object') {
		for (let key in b) {
			if (typeof a[key] === 'object' && typeof b[key] === 'object') {
				a[key] = extendObject(a[key], b[key]);
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
	getObject,
	extend: extendObject,
};
