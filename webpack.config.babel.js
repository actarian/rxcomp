const path = require('path');

let config = {
	mode: 'production',
	entry: './lib/rxcomp.js',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'rxcomp.js',
		libraryTarget: 'umd',
		globalObject: 'this',
		// libraryExport: 'default',
		library: 'webpackNumbers'
	},
	externals: {
		'rxjs': {
			commonjs: 'rxjs',
			commonjs2: 'rxjs',
			amd: 'rxjs',
			root: 'rxjs'
		}
	},
	module: {
		rules: [{
			test: /\.(js)$/,
			exclude: /(node_modules|bower_components)/,
			use: 'babel-loader'
    	}]
	},
};

module.exports = config;
