const typescript = require('typescript'),
	fs = require('fs'),
	path = require('path'),
	process = require('process'),
	rollupPluginCommonJs = require('@rollup/plugin-commonjs'),
	rollupPluginSourcemaps = require('rollup-plugin-sourcemaps'),
	rollupPluginLicense = require('rollup-plugin-license'),
	rollupPluginTypescript2 = require('rollup-plugin-typescript2'),
	through2 = require('through2'),
	vinyl = require('vinyl'),
	vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

const log = require('../logger/logger');
const { service } = require('../config/config');
const { getObject, extend } = require('../config/json');

const { rollup, rollupInput, rollupOutput } = require('./rollup');

/*
const RollupFormats = {
	'amd': 'amd', // Asynchronous Module Definition, used with module loaders like RequireJS
	'cjs': 'cjs', // CommonJS, suitable for Node and other bundlers
	'esm': 'esm', // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
	'iife': 'iife', // A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.)
	'umd': 'umd', // Universal Module Definition, works as amd, cjs and iife all in one
	'system': 'system', // Native format of the SystemJS loader
};

const TypescriptTarget = ["ES3", "ES5", "ES6", "ES2015", "ES2016", "ES2017", "ES2018", "ES2019", "ES2020", "ESNext"];
const TypescriptModule = ["CommonJS", "AMD", "System", "UMD", "ES6", "ES2015", "ESNext", "None"];
*/

// compile('tsconfig.json');

function typescript_(item) {
	const output = typescriptOutput(item)[0];
	switch (output.format) {
		case 'iife':
		case 'umd':
			return rollup(item);
			break;
		default:
			return typescriptLib(item, output);
	}
	/*
	'iife': 'iife', // A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.)
	'umd': 'umd', // Universal Module Definition, works as amd, cjs and iife all in one

	'amd': 'amd', // Asynchronous Module Definition, used with module loaders like RequireJS
	'cjs': 'cjs', // CommonJS, suitable for Node and other bundlers
	'esm': 'esm', // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
	'system': 'system', // Native format of the SystemJS loader
	*/
}

function typescriptLib(item, output) {
	return through2.obj(function(file, enc, callback) {
		// console.log('TfsCheckout', file.path);
		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			console.warn('Rollup, Streaming not supported');
			return callback(null, file);
		}
		const result = typescriptCompile(file, item, output);
		return callback(null, file);
	});
}

function typescriptCompile(file, item) {
	// Extract configuration from config file
	const config = typescriptConfig(item);
	// console.log('fileNames', config.fileNames);
	// console.log('options', config.options);

	// return 0;
	const program = typescript.createProgram(config.fileNames, config.options);
	const emitResult = program.emit();
	// console.log('emitResult', emitResult);

	// Report errors
	typescriptDiagnostic(typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

	// Return code
	const exitCode = emitResult.emitSkipped ? 1 : 0;
	// console.log('exitCode', exitCode);
	return exitCode;
	process.exit(exitCode);
}

function typescriptConfig(item) {

	const configFileName = 'tsconfig.json';

	const configDefault = {
		compilerOptions: {
			typeRoots: ['node_modules/@types'],
			strict: false
		}
	};
	/*
	"baseUrl": "",
	"mapRoot": "./",
	*/

	let configOverride = {
		files: [item.input],
		compilerOptions: {
			moduleResolution: 'node',
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
			removeComments: true,
			importHelpers: true,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			allowJs: true,
		},
		exclude: [
			'node_modules',
			'.npm'
		]
	};

	const output = typescriptOutput(item)[0];
	// console.log(output);
	switch (output.format) {
		case 'amd':
			configOverride = extend(configOverride, {
				compilerOptions: {
					target: 'es5',
					module: 'amd',
					outFile: output.file,
					lib: ['dom', 'es2015', 'es2016', 'es2017'],
					declaration: false,
					sourceMap: true,
				}
			});
			break;
		case 'cjs':
			configOverride = extend(configOverride, {
				compilerOptions: {
					target: 'es5',
					module: 'commonJS',
					outDir: output.file,
					lib: ['dom', 'es2015', 'es2016', 'es2017'],
					declaration: true,
					sourceMap: false,
				}
			});
			break;
		case 'esm':
			configOverride = extend(configOverride, {
				compilerOptions: {
					target: 'es2015',
					module: 'es6',
					outDir: output.file,
					lib: ['dom', 'es2015', 'es2016', 'es2017'],
					declaration: true,
					sourceMap: false,
				}
			});
			break;
		case 'system':
			configOverride = extend(configOverride, {
				compilerOptions: {
					target: 'es5',
					module: 'system',
					outFile: output.file,
					lib: ['dom', 'es2015', 'es2016', 'es2017'],
					declaration: false,
					sourceMap: true,
				}
			});
			break;
	}

	/*
	'amd': 'amd', // Asynchronous Module Definition, used with module loaders like RequireJS
	'cjs': 'cjs', // CommonJS, suitable for Node and other bundlers
	'esm': 'esm', // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
	'system': 'system', // Native format of the SystemJS loader
	*/

	const config = getObject(`./${configFileName}`, configDefault, configOverride);

	const configFileText = JSON.stringify(config);

	// Parse JSON, after removing comments. Just fancier JSON.parse
	const result = typescript.parseConfigFileTextToJson(configFileName, configFileText);
	const configObject = result.config;
	if (!configObject) {
		typescriptDiagnostic([result.error]);
		return;
		process.exit(1);
	}

	// Extract config infromation
	const configParseResult = typescript.parseJsonConfigFileContent(configObject, typescript.sys, path.dirname(configFileName));
	if (configParseResult.errors.length > 0) {
		typescriptDiagnostic(configParseResult.errors);
		return;
		process.exit(1);
	}
	return configParseResult;
}

function typescriptDiagnostic(diagnostics) {
	diagnostics.forEach(diagnostic => {
		let message = 'Error';
		if (diagnostic.file) {
			const where = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			message += ' ' + diagnostic.file.fileName + ' ' + where.line + ', ' + where.character + 1;
		}
		message += ': ' + typescript.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.log(message);
	});
}

function typescriptInput(item) {
	// const watchGlob = path.dirname(item.input) + '/**/*' + path.extname(item.input);
	// console.log('watchGlob', watchGlob);
	const plugins = [
		// Resolve source maps to the original source
		rollupPluginSourcemaps(),
		// Compile TypeScript files
		path.extname(item.input) === '.ts' ? rollupPluginTypescript2({
			rollupCommonJSResolveHack: true,
			clean: true,
			declaration: true
		}) : null,
		/*
		rollupPluginTypescript2({
			lib: ['es5', 'es6', 'dom'],
			target: 'es5',
			tsconfig: false,
		}),
		*/
		// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
		rollupPluginCommonJs(),
		// Allow node_modules resolution, so you can use 'external' to control
		// which external modules to include in the bundle
		// https://github.com/rollup/rollup-plugin-node-resolve#usage
		// rollupPluginNodeResolve(),
		/*
		rollupPluginBabel({
			presets: [
				[babelPresetEnv, {
					modules: false,
					loose: true
				}]
			],
			exclude: 'node_modules/**' // only transpile our source code
			// babelrc: false,
		}),
		*/
		rollupPluginLicense({
			banner: `@license <%= pkg.name %> v<%= pkg.version %>
			(c) <%= moment().format('YYYY') %> <%= pkg.author %>
			License: <%= pkg.license %>`,
		}),
	].filter(x => x);
	const input = {
		input: item.input,
		plugins: plugins,
		external: item.external || [],
		/*
		external: ['tslib'],
		watch: {
			include: watchGlob,
		},
		*/
	};
	return input;
}

function typescriptOutput(item) {
	const input = item.input;
	const output = item.output;
	const outputs = Array.isArray(output) ? output : [output];
	const default_ = {
		format: 'iife',
		name: item.name || null,
		globals: item.globals || {},
		sourcemap: true,
		minify: item.minify || false,
	};
	return outputs.map(x => {
		let output = Object.assign({}, default_);
		if (typeof x === 'string') {
			output.file = x;
		} else if (typeof x === 'object') {
			output = Object.assign(output, x);
		}
		output.name = output.name || path.basename(output.file, '.js');
		/*
		const plugins = [
			path.extname(input) === '.ts' ? rollupPluginTypescript2({
				target: output.format === 'es' ? 'ESNext' : 'ES5',
				module: output.format === 'es' ? 'ES6' : 'ES5',
				moduleResolution: output.format === 'iife' ? 'classic' : 'node',
				declaration: true
			}) : null,
		].filter(x => x);
		output.plugins = plugins;
		*/
		return output;
	});
}

module.exports = {
	typescript: typescript_,
	typescriptInput,
	typescriptOutput,
};
