const typescript = require('typescript'),
	fs = require('fs'),
	path = require('path'),
	process = require('process'),
	babelPresetEnv = require('@babel/preset-env'),
	rollup = require('rollup'),
	rollupPluginBabel = require('rollup-plugin-babel'),
	rollupPluginCommonJs = require('@rollup/plugin-commonjs'),
	rollupPluginSourcemaps = require('rollup-plugin-sourcemaps'),
	rollupPluginLicense = require('rollup-plugin-license'),
	rollupPluginNodeResolve = require('@rollup/plugin-node-resolve'),
	rollupPluginTypescript = require('rollup-plugin-typescript2'),
	// rollupPluginTypescript = require('@rollup/plugin-typescript'),
	through2 = require('through2'),
	vinyl = require('vinyl');

const { getObject, extend } = require('./json');

const { rollup_, rollupInput_, rollupOutput_ } = require('./rollup');

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

function typescript_(config, item) {
	const output = typescriptOutput_(item)[0];
	switch (output.format) {
		case 'iife':
		case 'umd':
			return rollup_(config, item);
			break;
		default:
			return typescriptLib_(config, item, output);
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

function typescriptLib_(config, item, output) {
	return through2.obj(function(file, enc, callback) {
		// console.log('TfsCheckout', file.path);
		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			console.warn('Rollup, Streaming not supported');
			return callback(null, file);
		}
		const result = typescriptCompile_(file, item, output);
		return callback(null, file);
		const rollupGenerate = (bundle, output, i) => {
			return bundle.generate(output).then(result => {
				if (!result) {
					return;
				}
				const newFileName = path.basename(output.file);
				const newFilePath = output.file; // path.join(file.base, newFileName);
				let targetFile;
				if (i > 0) {
					const newFile = new vinyl({
						cwd: file.cwd,
						base: file.base,
						path: newFilePath,
						stat: {
							isFile: () => true,
							isDirectory: () => false,
							isBlockDevice: () => false,
							isCharacterDevice: () => false,
							isSymbolicLink: () => false,
							isFIFO: () => false,
							isSocket: () => false
						}
					});
					this.push(newFile);
					targetFile = newFile;
				} else {
					file.path = newFilePath;
					targetFile = file;
				}
				// console.log(output.file, file.cwd, file.base, newFileName, newFilePath);
				const generated = result.output[0];
				// Pass sourcemap content and metadata to gulp-sourcemaps plugin to handle
				// destination (and custom name) was given, possibly multiple output bundles.
				/*
				if (createSourceMap) {
					generated.map.file = path.relative(originalCwd, originalPath)
					generated.map.sources = generated.map.sources.map(source => path.relative(originalCwd, source))
				}
				*/
				// return bundled file as buffer
				targetFile.contents = Buffer.from(generated.code);
				// apply sourcemap to output file
				/*
				if (createSourceMap) {
					applySourceMap(targetFile, generated.map);
				}
				*/
			}).catch(error => {
				console.log('Rollup generate error', error);
				/*
				process.nextTick(() => {
					this.emit('error', new Error('message'));
					cb(null, file)
				});
				*/
			});
		};
		rollup.rollup(typescriptInput_(item)).then(bundle => {
			const bundles = typescriptOutput_(item);
			return Promise.all(bundles.map((output, i) => rollupGenerate(bundle, output, i))).then(complete => {
				callback(null, file);
			});
			// return bundle.write(bundles);
		}).catch(error => {
			console.log('Rollup bundle error', error);
			/*
			process.nextTick(() => {
				this.emit('error', new Error('message'));
				cb(null, file)
			});
			*/
		});
	});
}

function typescriptCompile_(file, item) {
	// Extract configuration from config file
	const config = typescriptConfig_(item);
	// console.log('fileNames', config.fileNames);
	// console.log('options', config.options);

	// return 0;
	const program = typescript.createProgram(config.fileNames, config.options);
	const emitResult = program.emit();
	// console.log('emitResult', emitResult);

	// Report errors
	typescriptDiagnostic_(typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

	// Return code
	const exitCode = emitResult.emitSkipped ? 1 : 0;
	// console.log('exitCode', exitCode);
	return exitCode;
	process.exit(exitCode);
}

function typescriptConfig_(item) {

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

	const output = typescriptOutput_(item)[0];
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
		typescriptDiagnostic_([result.error]);
		return;
		process.exit(1);
	}

	// Extract config infromation
	const configParseResult = typescript.parseJsonConfigFileContent(configObject, typescript.sys, path.dirname(configFileName));
	if (configParseResult.errors.length > 0) {
		typescriptDiagnostic_(configParseResult.errors);
		return;
		process.exit(1);
	}
	return configParseResult;
}

function typescriptDiagnostic_(diagnostics) {
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

function typescriptInput_(item) {
	// const watchGlob = path.dirname(item.input) + '/**/*' + path.extname(item.input);
	// console.log('watchGlob', watchGlob);
	const plugins = [
		// Resolve source maps to the original source
		rollupPluginSourcemaps(),
		// Compile TypeScript files
		path.extname(item.input) === '.ts' ? rollupPluginTypescript({
			rollupCommonJSResolveHack: true,
			clean: true,
			declaration: true
		}) : null,
		/*
		rollupPluginTypescript({
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
	input = {
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

function typescriptOutput_(item) {
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
			path.extname(input) === '.ts' ? rollupPluginTypescript({
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
	typescript_,
	typescriptInput_,
	typescriptOutput_,
};
