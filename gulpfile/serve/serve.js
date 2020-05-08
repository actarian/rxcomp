const gulpConnect = require('gulp-connect'),
	url = require('url'),
	fs = require('fs');

const log = require('../logger/logger');
const { service } = require('../config/config');

// SERVE
function serve(done) {
	if (service.config.server) {
		const options = Object.assign({
			name: 'Development',
			root: './docs',
			port: 8001,
			host: 'localhost',
			https: false,
			path: '/',
			livereload: true,
		}, service.config.server || {});
		if (options.https && options.https.cert) {
			options.https.cert = fs.readFileSync(options.https.cert);
		}
		options.fallback = `${options.path}index.html`;
		const middleware = middleware_({
			logger: options.log ? log : undefined,
			rewrites: [{
				from: new RegExp(`^${options.path}.*$`),
				to: (context) => {
					return context.parsedUrl.pathname.replace(options.path, '/');
				}
			}]
		});
		options.middleware = (connect, opt) => {
			return [middleware];
		};
		gulpConnect.server(options, function() {
			this.server.on('close', done);
		});
	} else {
		done();
	}
}

function middleware_(options) {
	options = options || {};
	const logger = getLogger(options);
	return function(req, res, next) {
		const headers = req.headers;
		if (!headers || typeof headers.accept !== 'string') {
			logger(
				'Not rewriting',
				req.method,
				req.url,
				'because the client did not send an HTTP accept header.'
			);
			return next();
		} else if (headers.accept.indexOf('application/json') === 0) {
			if (req.url.indexOf('.json') !== -1) {
				req.method = 'GET';
			}
			/*
			logger(
				'Not rewriting',
				req.method,
				req.url,
				'because the client prefers JSON.'
			);
			return next();
			*/
		} else if (req.method !== 'GET') {
			logger(
				'Not rewriting',
				req.method,
				req.url,
				'because the method is not GET.'
			);
			return next();
		} else if (!acceptsHtml(headers.accept, options)) {
			logger(
				'Not rewriting',
				req.method,
				req.url,
				'because the client does not accept HTML.'
			);
			return next();
		}
		const parsedUrl = url.parse(req.url);
		let rewriteTarget;
		options.rewrites = options.rewrites || [];
		for (let i = 0; i < options.rewrites.length; i++) {
			const rewrite = options.rewrites[i];
			const match = parsedUrl.pathname.match(rewrite.from);
			if (match !== null) {
				rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to, req);
				if (rewriteTarget.charAt(0) !== '/') {
					logger(
						'We recommend using an absolute path for the rewrite target.',
						'Received a non-absolute rewrite target',
						rewriteTarget,
						'for URL',
						req.url
					);
				}
				logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
				req.url = rewriteTarget;
				return next();
			}
		}
		const pathname = parsedUrl.pathname;
		if (pathname.lastIndexOf('.') > pathname.lastIndexOf('/') &&
			options.disableDotRule !== true) {
			logger(
				'Not rewriting',
				req.method,
				req.url,
				'because the path includes a dot (.) character.'
			);
			return next();
		}
		rewriteTarget = options.index || '/index.html';
		logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
		req.url = rewriteTarget;
		next();
	};
};

function evaluateRewriteRule(parsedUrl, match, rule, req) {
	if (typeof rule === 'string') {
		return rule;
	} else if (typeof rule !== 'function') {
		throw new Error('Rewrite rule can only be of type string or function.');
	}
	return rule({
		parsedUrl: parsedUrl,
		match: match,
		request: req
	});
}

function acceptsHtml(header, options) {
	options.htmlAcceptHeaders = options.htmlAcceptHeaders || ['text/html', '*/*'];
	for (let i = 0; i < options.htmlAcceptHeaders.length; i++) {
		if (header.indexOf(options.htmlAcceptHeaders[i]) !== -1) {
			return true;
		}
	}
	return false;
}

function getLogger(options) {
	if (options && options.logger) {
		return options.logger;
	} else if (options && options.verbose) {
		// eslint-disable-next-line no-console
		return console.log.bind(console);
	}
	return function() {};
}

module.exports = {
	serve,
};
