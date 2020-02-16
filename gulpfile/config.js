const fs = require('fs'),
	path = require('path'),
	process = require('process');

const { watch } = require('gulp');

const log = require('./logger');

const { getObject, extend } = require('./json');

const path_ = './gulpfile-config.json';
const options = getOptions();
const target = options.target || 'browser';

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

function getTarget_() {
	return {
		compile: [],
		bundle: [],
	};
}

function getConfig() {
	let configDefault = {
		targets: {
			browser: getTarget_(),
			dist: getTarget_()
		},
		tfs: false,
		server: {
			src: './docs',
			path: '/gulpfile-config/',
			host: 'localhost',
			port: 40900
		}
	};
	const config = getObject(path_, configDefault);
	config.target = config.targets[target] || getTarget_();
	return config;
}

function configWatcher_(callback) {
	const configWatch = watch(path_, function config(done) {
		config = getConfig();
		if (typeof callback === 'function') {
			return callback(done);
		}
	}).on('change', logWatch);
	return [configWatch];
}

function logWatch(path, stats) {
	log('Changed', path);
}

module.exports = {
	getConfig: getConfig,
	path: path_,
	target: target,
	configWatcher_: configWatcher_
};
