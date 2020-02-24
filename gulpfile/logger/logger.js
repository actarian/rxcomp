const ansyGray = require('ansi-gray');
const colorSupport = require('color-support');
const consoleConsole = require('console').Console;
const parseNodeVersion = require('parse-node-version');
const timeStamp = require('time-stamp');

const nodeVersion = parseNodeVersion(process.version);

const colorDetectionOptions = {
	// If on Windows, ignore the isTTY check
	// This is due to AppVeyor (and thus probably common Windows platforms?) failing the check
	// TODO: If this is too broad, we can reduce it to an APPVEYOR env check
	ignoreTTY: (process.platform === 'win32'),
};

// Needed to add this because node 10 decided to start coloring log output randomly
let console;
if (nodeVersion.major >= 10) {
	// Node 10 also changed the way this is constructed
	console = new consoleConsole({
		stdout: process.stdout,
		stderr: process.stderr,
		colorMode: false,
	});
} else {
	console = new consoleConsole(process.stdout, process.stderr);
}

const palette = {
	Reset: '\x1b[0m',
	Bright: '\x1b[1m',
	Dim: '\x1b[2m',
	Underscore: '\x1b[4m',
	Blink: '\x1b[5m',
	Reverse: '\x1b[7m',
	Hidden: '\x1b[8m',
	//
	FgBlack: '\x1b[30m',
	FgRed: '\x1b[31m',
	FgGreen: '\x1b[32m',
	FgYellow: '\x1b[33m',
	FgBlue: '\x1b[34m',
	FgMagenta: '\x1b[35m',
	FgCyan: '\x1b[36m',
	FgWhite: '\x1b[37m',
	//
	BgBlack: '\x1b[40m',
	BgRed: '\x1b[41m',
	BgGreen: '\x1b[42m',
	BgYellow: '\x1b[43m',
	BgBlue: '\x1b[44m',
	BgMagenta: '\x1b[45m',
	BgCyan: '\x1b[46m',
	BgWhite: '\x1b[47m',
};

const colors = [palette.FgWhite, palette.FgCyan, palette.FgGreen, palette.FgYellow, palette.FgMagenta, palette.FgBlue];

function hasFlag(flag) {
	return (process.argv.indexOf('--' + flag) !== -1);
}

function addColor(str) {
	if (hasFlag('no-color')) {
		return str;
	}

	if (hasFlag('color')) {
		return ansyGray(str);
	}

	if (colorSupport(colorDetectionOptions)) {
		return ansyGray(str);
	}

	return str;
}

function getTimestamp() {
	return '[' + addColor(timeStamp('HH:mm:ss')) + ']';
}

function getLogMessage(items) {
	let a = Array.from(items);
	a = [].concat.apply([], (a.map((x, i) => [colors[i % colors.length], x])));
	a.push(palette.Reset);
	return a;
}

function getErrorMessage(items) {
	let a = Array.from(items);
	a = [].concat.apply([], (a.map((x, i) => [palette.FgRed, x])));
	a.push(palette.Reset);
	return a;
}

function log() {
	const time = getTimestamp();
	process.stdout.write(time + ' ');
	console.log.apply(console, getLogMessage(arguments));
	return this;
}

function info() {
	const time = getTimestamp();
	process.stdout.write(time + ' ');
	console.info.apply(console, getLogMessage(arguments));
	return this;
}

function dir() {
	const time = getTimestamp();
	process.stdout.write(time + ' ');
	console.dir.apply(console, getLogMessage(arguments));
	return this;
}

function warn() {
	const time = getTimestamp();
	process.stderr.write(time + ' ');
	console.warn.apply(console, getLogMessage(arguments));
	return this;
}

function error() {
	const time = getTimestamp();
	process.stderr.write(time + ' ');
	console.error.apply(console, getErrorMessage(arguments));
	return this;
}

module.exports = log;
module.exports.info = info;
module.exports.dir = dir;
module.exports.warn = warn;
module.exports.error = error;
