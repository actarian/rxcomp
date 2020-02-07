const fs = require('fs'),
	path = require('path'),
	process = require('process');

const { watch } = require('gulp');

const log = require('./logger');

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

function getConfig() {
	const defaultTarget = {
		compile: [],
		bundle: []
	};
	let config = {
		targets: {
			browser: defaultTarget,
			dist: defaultTarget
		},
		tfs: false,
		server: {
			src: './docs',
			path: '/gulpfile-config/',
			host: 'localhost',
			port: 40900
		}
	};
	if (fs.existsSync(path_)) {
		const gulpfileConfigText = fs.readFileSync(path_, 'utf8');
		const gulpfileConfig = JSON.parse(stripBom(gulpfileConfigText));
		config = Object.assign(config, gulpfileConfig);
	} else {
		log.warn('missing gulpfile-config.json');
	}
	config.target = config.targets[target] || defaultTarget;
	return config;
}

function stripBom(text) {
	text = text.toString();
	if (text.charCodeAt(0) === 0xFEFF) {
		text = text.slice(1);
	}
	return text;
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
