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

function typescriptConfig_(item) {
	const configFileName = 'tsconfig.json';

	// Read config file
	const configFileText = `{
		"compilerOptions": {
			${true ? '"target": "es2015",' : '"target": "esnext",'}
			${true ? '"module": "es6",' : '"module": "esnext",'}
			${false ? '"outFile": "dist/test/rxcomp.js",' : '"outDir": "dist/test",'}
			"lib": ["dom", "es2015", "es2016", "es2017"],
			"moduleResolution": "node",
			"typeRoots": ["node_modules/@types"],
			"declaration": true,
			"emitDecoratorMetadata": true,
			"experimentalDecorators": true,
			"sourceMap": true,
			"removeComments": true,
			"importHelpers": true,
			"allowSyntheticDefaultImports": true,
			"esModuleInterop": true,
			"allowJs": true,
			"strict": false,
		},
		"files": [
			"src/rxcomp.ts"
		],
		"exclude": [
			"node_modules",
			".npm"
		]
	}`;
	/*
	"baseUrl": "",
	"mapRoot": "./",
	*/
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

function typescriptCompile_(file, item) {
	// Extract configuration from config file
	const config = typescriptConfig_(item);
	console.log('fileNames', config.fileNames);
	console.log('options', config.options);

	// return 0;
	const program = typescript.createProgram(config.fileNames, config.options);
	const emitResult = program.emit();
	console.log('emitResult', emitResult);

	// Report errors
	typescriptDiagnostic_(typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

	// Return code
	const exitCode = emitResult.emitSkipped ? 1 : 0;
	console.log('exitCode', exitCode);
	return exitCode;
	process.exit(exitCode);
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

// compile('tsconfig.json');

function typescript_(config, item) {
	return through2.obj(function(file, enc, callback) {
		// console.log('TfsCheckout', file.path);
		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			console.warn('Rollup, Streaming not supported');
			return callback(null, file);
		}
		const result = typescriptCompile_(file, item);

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
		rollup.rollup(typescriptInput_(file.path)).then(bundle => {
			const bundles = typescriptOutput_(item.input, item.output);
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

function typescriptInput_(input) {
	// const watchGlob = path.dirname(input) + '/**/*' + path.extname(input);
	// console.log('watchGlob', watchGlob);
	const plugins = [
		// Resolve source maps to the original source
		rollupPluginSourcemaps(),
		// Compile TypeScript files
		path.extname(input) === '.ts' ? rollupPluginTypescript({
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
		input: input,
		plugins: plugins,
		external: [],
		/*
		external: ['tslib'],
		watch: {
			include: watchGlob,
		},
		*/
	};
	return input;
}

function typescriptOutput_(input, output) {
	const outputs = Array.isArray(output) ? output : [output];
	const default_ = {
		format: 'umd',
		globals: {},
		external: [],
		sourcemap: true
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
