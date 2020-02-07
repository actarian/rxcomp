const {
	build,
	buildAndWatch,
	buildWatchAndServe,
	bundle,
	compile,
	serve,
	watch
} = require('./gulpfile/gulpfile-config');

exports.build = build;
exports.bundle = bundle;
exports.compile = compile;
exports.serve = serve;
exports.watch = watch;

exports.start = buildAndWatch;
exports.default = buildWatchAndServe;
