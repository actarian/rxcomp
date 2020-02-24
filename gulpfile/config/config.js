const fs = require('fs'),
	path = require('path'),
	process = require('process');

const { watch } = require('gulp');

const log = require('../logger/logger');

const { getObject, extend } = require('./json');

const CONFIG_PATH = './gulpfile-config.json';
const options = getOptions();
const target = options.target || 'browser';

const service = {
	options,
};

function getOptions() {
	let key = undefined;
	const o = process.argv.reduce((p, c, a) => {
		let k, v;
		if (c.indexOf('--') === 0) {
			k = c.substr(2);
		} else {
			v = c;
		}
		if (key) {
			p[key] = (v === undefined ? true : v);
			key = undefined;
		}
		key = k;
		return p;
	}, {});
	if (key) {
		o[key] = true;
	}
	return o;
}

function getTarget() {
	return {
		compile: [],
		bundle: [],
	};
}

function getConfig() {
	let configDefault = {
		targets: {
			browser: getTarget(),
			dist: getTarget()
		},
		server: {
			src: './docs',
			path: '/gulpfile-config/',
			host: 'localhost',
			port: 40900
		},
		tfs: false
	};
	const config = getObject(CONFIG_PATH, configDefault);
	config.target = config.targets[target] || getTarget();
	service.target = target;
	service.config = config.target;
	service.config.server = config.server;
	service.config.tfs = config.tfs;
	return config;
}

/*
function configWatcher(callback) {
	const configWatch = watch(CONFIG_PATH, function config(done) {
		// config = getConfig();
		if (typeof callback === 'function') {
			return callback(done);
		}
	}).on('change', logWatch);
	return [configWatch];
}

function logWatch(path, stats) {
	log('Changed', path);
}
*/

module.exports = {
	CONFIG_PATH,
	getConfig: getConfig,
	target: target,
	service: service,
};
