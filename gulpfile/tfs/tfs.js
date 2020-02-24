const fs = require('fs'),
	gulpIf = require('gulp-if'),
	tfs = require('tfs'),
	through2 = require('through2');

const log = require('../logger/logger');
const { service } = require('../config/config');

function tfsCheckout(skip) {
	return gulpIf(!skip && service.config.tfs, through2.obj((file, enc, callback) => {
		// console.log('TfsCheckout', file.path);
		if (fs.existsSync(file.path)) {
			const paths = [file.path];
			if (fs.existsSync(file.path + '.map')) {
				paths.push(file.path + '.map');
			}
			tfs('checkout', paths, null, (responseError, response) => {
				callback(null, file);
				if (responseError) {
					console.error(responseError.error);
					return;
				}
				log('Checkout', file.path, response.message);
			});
		} else {
			callback(null, file);
		}
	}));
}

module.exports = tfsCheckout;
