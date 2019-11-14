(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('rxjs'), require('rxjs/operators')) :
  typeof define === 'function' && define.amd ? define('main', ['rxjs', 'rxjs/operators'], factory) :
  (global = global || self, factory(global.rxjs, global.rxjs.operators));
}(this, (function (rxjs, operators) { 'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  var Directive = function Directive() {};
  Directive.meta = {
    selector: '[(directive)]'
  };

  var Component = function Component() {};
  Component.meta = {
    selector: '[component]'
  };

  var Context =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(Context, _Component);

    function Context(parent, descriptors) {
      var _this;

      _this = _Component.call(this) || this;
      var parentPrototypeDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(parent));
      delete parentPrototypeDescriptors.constructor;
      Object.keys(parentPrototypeDescriptors).forEach(function (key) {
        console.log('1', key);
        var descriptor = parentPrototypeDescriptors[key];

        if (typeof descriptor.value == "function") {
          descriptor.value = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            parent[key].apply(parent, args);
          };
        }
      }); // console.log('parentPrototypeDescriptors', parentPrototypeDescriptors);

      var parentDescriptors = Object.getOwnPropertyDescriptors(parent);
      Object.keys(parentDescriptors).forEach(function (key) {
        switch (key) {
          case '$id':
          case 'state$':
          case 'unsubscribe$':
          case 'pushState':
            break;

          default:
            console.log('2', key);
            var descriptor = parentDescriptors[key];

            if (typeof descriptor.value == "function") {
              descriptor.value = function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                parent[key].apply(parent, args);
              };
            }

        }
      });
      /*
      // console.log('parentDescriptors', parentDescriptors);
      Object.defineProperties(this, Object.assign(parentPrototypeDescriptors, parentDescriptors, {
      	state$: {
      		value: new BehaviorSubject(this),
      		writable: false,
      		enumerable: false,
      	},
      	unsubscribe$: {
      		value: new Subject(),
      		writable: false,
      		enumerable: false,
      	}
      }, descriptors));
      */

      return _this;
    }
    /*
    pushState() {
    	this.state$.next(this);
    }
    */


    return Context;
  }(Component);

  var ID = 0;
  var CONTEXTS = {};
  var NODES = {};

  var Module =
  /*#__PURE__*/
  function () {
    function Module(options) {
      if (!options) {
        throw 'missing options';
      }

      if (!options.bootstrap) {
        throw 'missing bootstrap';
      }

      this.options = options;
      var pipes = {};

      if (options.pipes) {
        options.pipes.forEach(function (x) {
          return pipes[x.meta.name] = x;
        });
      }

      this.pipes = pipes;
      var bootstrap = options.bootstrap;
      this.node = document.querySelector(bootstrap.meta.selector);

      if (!this.node) {
        throw "missing node " + bootstrap.meta.selector;
      }

      this.root = this.makeInstance(this.node, bootstrap, bootstrap.meta.selector, window);
      this.selectors = Module.unwrapSelectors(options.factories);
    }

    var _proto = Module.prototype;

    _proto.use$ = function use$() {
      var _this = this;

      return rxjs.of(Module.querySelectorsAll(this.node, this.selectors, [])).pipe(operators.filter(function (matches) {
        return matches.length > 0;
      }), operators.map(function (matches) {
        return matches.map(function (match) {
          return _this.makeInstance(match.node, match.factory, match.selector);
        }).filter(function (x) {
          return x;
        });
      }), operators.tap(function (instances) {
        return instances.forEach(function (instance) {
          // parse component text nodes
          var context = Module.getContext(instance);
          var isComponent = context.factory.prototype instanceof Component;

          if (isComponent) {
            _this.parse(context.node, instance);
          }
        });
      }), operators.shareReplay(1));
    };

    _proto.makeContext = function makeContext(instance, parentInstance, node, selector) {
      var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
      console.log('Module.makeContext', context, context.instance, context.node);
      return context;
    };

    _proto.makeInstance = function makeInstance(node, factory, selector, parentInstance, args) {
      var _this2 = this;

      if (parentInstance || node.parentNode) {
        var isComponent = factory.prototype instanceof Component;
        var meta = factory.meta; // collect parentInstance scope

        parentInstance = parentInstance || this.getParentScope(node.parentNode);

        if (!parentInstance) {
          return;
        } // creating factory instance


        var instance = _construct(factory, args || []); // injecting state$ and unsubscribe$ subjects


        Object.defineProperties(instance, {
          state$: {
            value: new rxjs.BehaviorSubject(instance),
            writable: false,
            enumerable: false
          },
          unsubscribe$: {
            value: new rxjs.Subject(),
            writable: false,
            enumerable: false
          }
        }); // injecting instance pushState method

        var moduleRef = this;

        instance.pushState = function () {
          if (isComponent) {
            moduleRef.parse(node, instance);
          }

          this.state$.next(this);
        }; // creating instance context


        var context = Module.makeContext(this, instance, parentInstance, node, factory, selector); // creating component input and outputs

        if (isComponent) {
          context.inputs = this.makeInputs(meta, instance);
          context.outputs = this.makeOutputs(meta, instance);
        } // calling onInit event


        if (typeof instance.onInit === 'function') {
          instance.onInit();
        } // subscribe to parent state


        if (parentInstance.state$) {
          parentInstance.state$.pipe( // filter(() => node.parentNode),
          operators.takeUntil(instance.unsubscribe$)).subscribe(function (state) {
            // resolve component input outputs
            if (isComponent) {
              _this2.resolveInputsOutputs(instance, state);
            } // calling onState event with parentInstance


            if (typeof instance.onState === 'function') {
              // console.log('onState', instance.constructor.meta.selector, state);
              instance.onState(state);
            } // push instance state for subscribers


            instance.pushState();
          });
        }
        /*
        // parse component text nodes
        if (isComponent) {
        	this.parse(node, instance);
        }
        */


        return instance;
      }
    };

    _proto.remove = function remove(node) {
      var ids = [];
      Module.traverseDown(node, function (node) {
        for (var _i = 0, _Object$entries = Object.entries(CONTEXTS); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _Object$entries[_i],
              id = _Object$entries$_i[0],
              context = _Object$entries$_i[1];

          if (context.node === node) {
            var instance = context.instance;
            instance.unsubscribe$.next();
            instance.unsubscribe$.complete();

            if (typeof instance.onDestroy === 'function') {
              instance.onDestroy();
            }

            ids.push(id);
          }
        }
      });
      ids.forEach(function (id) {
        return Module.deleteContext(id);
      }); // console.log('Module.remove', ids);

      return node;
    };

    _proto.compile = function compile(node, context) {
      var _this3 = this;

      console.log('Module.compile', context);
      var matches = Module.querySelectorsAll(node, this.selectors, []);
      var instances = matches.map(function (match) {
        var instance = _this3.makeInstance(match.node, match.factory, match.selector, context ? context.instance : undefined);

        if (match.factory.prototype instanceof Component) {
          context = undefined; // !!!
        }

        return instance;
      }).filter(function (x) {
        return x !== undefined;
      });
      return instances;
    };

    _proto.evaluate = function evaluate(text, instance) {
      var _this4 = this;

      var parse_eval_ = function parse_eval_() {
        var expression = arguments.length <= 1 ? undefined : arguments[1]; // console.log('expression', expression);

        var parse_func_ = _this4.makeFunction(expression);

        return _this4.resolve(parse_func_, instance, instance);
      }; // console.log(text);


      return text.replace(/\{{2}(?!\{)(.*?\}*)\}{2}/g, parse_eval_);
    };

    _proto.parse = function parse(node, instance) {
      // console.log('node', node.childNodes.length, node);

      /*
      if (node.hasAttribute('[innerHTML]')) {
      	const innerHTML = `{{${node.getAttribute('[innerHTML]')}}}`;
      	node.innerHTML = parse_replace_(innerHTML);
      } else if (node.hasAttribute('innerHTML')) {
      	const innerHTML = node.getAttribute('innerHTML');
      	node.innerHTML = parse_replace_(innerHTML);
      } else {
      	// childNodes
      }
      */
      // console.log(node, instance);
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];

        if (child.nodeType === 1) {
          this.parse(child, instance);
        } else if (child.nodeType === 3) {
          var text = child.nodeValue;
          var replacedText = this.evaluate(text, instance);

          if (text !== replacedText) {
            // !!! save in var
            // node.setAttribute('innerHTML', text);
            var textNode = document.createTextNode(replacedText);
            node.replaceChild(textNode, child);
          }
        }
      }
    };

    _proto.resolve = function resolve(expressionFunc, state, payload) {
      return expressionFunc.apply(state, [payload, this]);
    };

    _proto.makeInputs = function makeInputs(meta, instance) {
      var _this5 = this;

      var inputs = {};

      if (meta.inputs) {
        meta.inputs.forEach(function (key, i) {
          return inputs[key] = _this5.makeInput(instance, key);
        });
      }

      return inputs;
    };

    _proto.makeOutputs = function makeOutputs(meta, instance) {
      var _this6 = this;

      var outputs = {};

      if (meta.outputs) {
        meta.outputs.forEach(function (key, i) {
          return outputs[key] = _this6.makeOutput(instance, key);
        });
      }

      return outputs;
    };

    _proto.resolveInputsOutputs = function resolveInputsOutputs(instance, state) {
      var _this7 = this;

      var context = Module.getContext(instance);
      var parentInstance = context.parentInstance;
      var inputs = context.inputs;
      Object.keys(inputs).forEach(function (key) {
        var inputFunction = inputs[key];

        var value = _this7.resolve(inputFunction, parentInstance, instance);

        instance[key] = value;
      });
      /*
      const outputs = context.outputs;
      Object.keys(outputs).forEach(key => {
      	const inpuoutputFunctiontFunction = outputs[key];
      	const value = this.resolve(outputFunction, parentInstance, null);
      	// console.log(`setted -> ${key}`, value);
      });
      */
    };

    _proto.getScope = function getScope(node) {
      if (node === document) {
        return window;
      }

      var context = Module.getContextByNode(node);

      if (context) {
        return context.instance;
      }
    };

    _proto.getParentScope = function getParentScope(node) {
      var _this8 = this;

      return Module.traverseUp(node, function (node) {
        return _this8.getScope(node);
      });
    } //
    ;

    _proto.optionalChaining = function optionalChaining(expression) {
      var regex = /(\w+(\?\.))+([\.|\w]+)/g;
      var previous;
      expression = expression.replace(regex, function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var tokens = args[0].split('?.');

        for (var i = 0; i < tokens.length - 1; i++) {
          var a = i > 0 ? "(" + tokens[i] + " = " + previous + ")" : tokens[i];
          var b = tokens[i + 1];
          previous = i > 0 ? a + "." + b : "(" + a + " ? " + a + "." + b + " : void 0)"; // log(previous);
        }

        return previous || '';
      });
      return expression;
    };

    _proto.makeFunction = function makeFunction(expression, params) {
      if (params === void 0) {
        params = ['$instance'];
      }

      if (!expression) {
        return function () {
          return null;
        };
      }

      var pipes = this.pipes;
      var transforms = Module.getPipesSegments(expression);
      expression = transforms.shift().trim();
      expression = this.optionalChaining(expression); // console.log('expression', "${expression}", ${params.join(',')}, this);
      // return expression_func;
      // console.log(pipes, transforms, expression);
      // console.log(transforms.length, params);

      params.push('module'); // keyword 'this' represents state from func.apply(state, instance)

      if (transforms.length) {
        expression = transforms.reduce(function (expression, transform, i) {
          var params = Module.getPipeParamsSegments(transform);
          var name = params.shift().trim();
          var pipe = pipes[name];

          if (!pipe || typeof pipe.transform !== 'function') {
            throw "missing pipe " + name;
          }

          return "pipes." + name + ".transform(" + expression + "," + params.join(',') + ")";
        }, expression); // console.log('expression', expression);

        var expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + params.join(',') + ") {\n\t\t\t\t\tconst pipes = module.pipes;\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");
        return expression_func;
      } else {
        // console.log('expression', expression);
        var _expression_func = new Function(this.options.debug ? "with(this) {\n\t\t\t\treturn (function (" + params.join(',') + ") {\n\t\t\t\t\tlet value;\n\t\t\t\t\ttry {\n\t\t\t\t\t\tvalue = " + expression + ";\n\t\t\t\t\t} catch(e) {\n\t\t\t\t\t\tconsole.error('" + expression.replace(/\'/g, '"') + "', this);\n\t\t\t\t\t\tvalue = e.message;\n\t\t\t\t\t}\n\t\t\t\t\treturn value;\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}" : "with(this) {\n\t\t\t\treturn (function (" + params.join(',') + ") {\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");

        return _expression_func;
      }
    };

    _proto.makeInput = function makeInput(instance, name) {
      var context = Module.getContext(instance);
      var node = context.node;
      var expression = node.getAttribute("[" + name + "]");
      return this.makeFunction(expression);
    };

    _proto.makeOutput = function makeOutput(instance, name) {
      var _this9 = this;

      var context = Module.getContext(instance);
      var node = context.node;
      var parentInstance = context.parentInstance;
      var expression = node.getAttribute("(" + name + ")");
      var outputFunction = this.makeFunction(expression, ['$event']);
      var output$ = new rxjs.Subject().pipe(operators.tap(function (event) {
        _this9.resolve(outputFunction, parentInstance, event);
      }));
      output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
      instance[name] = output$;
      return outputFunction;
    };

    Module.getPipesSegments = function getPipesSegments(expression) {
      var segments = [];
      var i = 0,
          word = '',
          block = 0;
      var t = expression.length;

      while (i < t) {
        var c = expression.substr(i, 1);

        if (c === '{' || c === '(' || c === '[') {
          block++;
        }

        if (c === '}' || c === ')' || c === ']') {
          block--;
        }

        if (c === '|' && block === 0) {
          if (word.length) {
            segments.push(word);
          }

          word = '';
        } else {
          word += c;
        }

        i++;
      }

      if (word.length) {
        segments.push(word);
      }

      return segments;
    };

    Module.getPipeParamsSegments = function getPipeParamsSegments(expression) {
      var segments = [];
      var i = 0,
          word = '',
          block = 0;
      var t = expression.length;

      while (i < t) {
        var c = expression.substr(i, 1);

        if (c === '{' || c === '(' || c === '[') {
          block++;
        }

        if (c === '}' || c === ')' || c === ']') {
          block--;
        }

        if (c === ':' && block === 0) {
          if (word.length) {
            segments.push(word);
          }

          word = '';
        } else {
          word += c;
        }

        i++;
      }

      if (word.length) {
        segments.push(word);
      }

      return segments;
    };

    Module.unwrapSelectors = function unwrapSelectors(factories) {
      var selectors = [];
      factories.forEach(function (factory) {
        factory.meta.selector.split(',').forEach(function (selector) {
          selector = selector.trim();

          if (selector.indexOf('.') === 0) {
            var className = selector.replace(/\./g, '');
            selectors.push(function (node) {
              var match = node.classList.has(className);
              return match ? {
                node: node,
                factory: factory,
                selector: selector
              } : false;
            });
          } else if (selector.match(/\[(.+)\]/)) {
            var attribute = selector.substr(1, selector.length - 2);
            selectors.push(function (node) {
              var match = node.hasAttribute(attribute);
              return match ? {
                node: node,
                factory: factory,
                selector: selector
              } : false;
            });
          } else {
            selectors.push(function (node) {
              var match = node.nodeName.toLowerCase() === selector.toLowerCase();
              return match ? {
                node: node,
                factory: factory,
                selector: selector
              } : false;
            });
          }
        });
      });
      return selectors;
    };

    Module.matchSelectors = function matchSelectors(node, selectors, results) {
      selectors.forEach(function (selector) {
        var match = selector(node);

        if (match) {
          var factory = match.factory;

          if (factory.prototype instanceof Component && factory.meta.template) {
            node.innerHTML = factory.meta.template;
          }

          results.push(match);
        }
      });
      return results;
    };

    Module.querySelectorsAll = function querySelectorsAll(node, selectors, results) {
      if (node.nodeType === 1) {
        results = this.matchSelectors(node, selectors, results);
      }

      var childNodes = node.childNodes;

      if (childNodes) {
        for (var i = 0; i < childNodes.length; i++) {
          results = this.querySelectorsAll(childNodes[i], selectors, results);
        }
      }

      return results;
    };

    Module.traverseUp = function traverseUp(node, callback, i) {
      if (i === void 0) {
        i = 0;
      }

      if (!node) {
        return;
      }

      var result = callback(node, i);

      if (result) {
        return result;
      }

      return this.traverseUp(node.parentNode, callback, i + 1);
    };

    Module.traverseDown = function traverseDown(node, callback, i) {
      if (i === void 0) {
        i = 0;
      }

      if (!node) {
        return;
      }

      var result = callback(node, i);

      if (result) {
        return result;
      }

      if (node.nodeType === 1) {
        var j = 0,
            t = node.childNodes.length;

        while (j < t && !result) {
          result = this.traverseDown(node.childNodes[j], callback, i + 1);
          j++;
        }
      }

      return result;
    };

    Module.traversePrevious = function traversePrevious(node, callback, i) {
      if (i === void 0) {
        i = 0;
      }

      if (!node) {
        return;
      }

      var result = callback(node, i);

      if (result) {
        return result;
      }

      return this.traversePrevious(node.previousSibling, callback, i + 1);
    };

    Module.traverseNext = function traverseNext(node, callback, i) {
      if (i === void 0) {
        i = 0;
      }

      if (!node) {
        return;
      }

      var result = callback(node, i);

      if (result) {
        return result;
      }

      return this.traverseNext(node.nextSibling, callback, i + 1);
    };

    Module.use$ = function use$(options) {
      /*
      if (!options.factories) {
      	options.factories = [
      		ClassDirective,
      		EventDirective,
      		IfStructure,
      		ForStructure,
      		StyleDirective
      	];
      }
      if (!options.pipes) {
      	options.pipes = [
      		JsonPipe
      	];
      }
      */
      return new Module(options).use$();
    };

    Module.getContext = function getContext(instance) {
      return CONTEXTS[instance.rxcompId];
    };

    Module.makeContext = function makeContext(module, instance, parentInstance, node, factory, selector) {
      instance.rxcompId = ++ID;
      var context = {
        module: module,
        instance: instance,
        parentInstance: parentInstance,
        node: node,
        factory: factory,
        selector: selector
      };
      var rxcompNodeId = node.dataset.rxcompId = node.dataset.rxcompId || ++ID;
      var nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
      nodeContexts.push(context);
      return CONTEXTS[instance.rxcompId] = context;
    };

    Module.deleteContext = function deleteContext(id) {
      var context = CONTEXTS[id];
      var nodeContexts = NODES[context.node.dataset.id];
      var index = nodeContexts.indexOf(context);

      if (index !== -1) {
        nodeContexts.splice(index, 1);
      }

      delete CONTEXTS[id];
    };

    Module.getContextByNode = function getContextByNode(node) {
      var context;
      var nodeContexts = NODES[node.dataset.rxcompId];

      if (nodeContexts) {
        context = nodeContexts.reduce(function (previous, current) {
          if (current.node === node && current.factory.prototype instanceof Component) {
            if (previous && current.factory.prototype instanceof Context) {
              return previous;
            } else {
              return current;
            }
          } else {
            return previous;
          }
        }, null);
      }

      return context;
      /*
      const context = Object.keys(CONTEXTS).reduce((previous, id) => {
      	const current = CONTEXTS[id];
      	if (current.node === node && current.factory.prototype instanceof Component) {
      		if (previous && current.factory.prototype instanceof Context) {
      			return previous;
      		} else {
      			return current;
      		}
      	} else {
      		return previous;
      	}
      }, null);
      	return context;
      */

      /*
      let id = Object.keys(CONTEXTS).find(id => CONTEXTS[id].node === node && CONTEXTS[id].factory.prototype instanceof Component);
      if (id) {
      	const context = CONTEXTS[id];
      	return context;
      }
      */
    };

    return Module;
  }();

  var ClassDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(ClassDirective, _Directive);

    function ClassDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = ClassDirective.prototype;

    _proto.onInit = function onInit() {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var expression = node.getAttribute('[class]');
      this.classFunction = module.makeFunction(expression); // this.classList = [...node.classList.keys()];
      // console.log('ClassDirective.onInit', this.classList, expression);
    };

    _proto.onState = function onState(state) {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var classList = module.resolve(this.classFunction, state, this);
      Object.keys(classList).forEach(function (key) {
        if (classList[key]) {
          node.classList.add(key);
        } else {
          node.classList.remove(key);
        }
      }); // console.log('ClassDirective.onState', classList);
    };

    return ClassDirective;
  }(Directive);
  ClassDirective.meta = {
    selector: "[[class]]"
  };

  var EVENTS = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

  var EventDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(EventDirective, _Directive);

    function EventDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = EventDirective.prototype;

    _proto.onInit = function onInit() {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var selector = context.selector;
      var parentInstance = context.parentInstance;
      var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
      var event$ = this.event$ = rxjs.fromEvent(node, event).pipe(operators.shareReplay(1));
      var expression = node.getAttribute("(" + event + ")");

      if (expression) {
        var outputFunction = module.makeFunction(expression, ['$event']);
        event$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
          // console.log(parentInstance);
          module.resolve(outputFunction, parentInstance, event);
        });
      } else {
        parentInstance[event + "$"] = event$;
      } // console.log('EventDirective.onInit', 'selector', selector, 'event', event);

    };

    return EventDirective;
  }(Directive);
  EventDirective.meta = {
    selector: "[(" + EVENTS.join(')],[(') + ")]"
  };

  var Structure = function Structure() {};
  Structure.meta = {
    selector: '[(directive)]'
  };

  var ForItem =
  /*#__PURE__*/
  function (_Context) {
    _inheritsLoose(ForItem, _Context);

    // !!! try with payload options { key, $key, value, $value, index, count } or use onInit()
    function ForItem(key, $key, value, $value, index, count, parentInstance) {
      var _this;

      // console.log(key, $key, value, $value);
      _this = _Context.call(this, parentInstance) || this;
      /*
      super(parentInstance, {
      	[key]: {
      		get: function() {
      			return this.$key;
      		},
      		set: function(key) {
      			this.$key = key;
      		}
      	},
      	[value]: {
      		get: function() {
      			return this.$value;
      		},
      		set: function(value) {
      			this.$value = value;
      		}
      	}
      });
      */

      _this[key] = $key;
      _this[value] = $value;
      _this.index = index;
      _this.count = count;
      return _this;
    }

    _createClass(ForItem, [{
      key: "first",
      get: function get() {
        return this.index === 0;
      }
    }, {
      key: "last",
      get: function get() {
        return this.index === this.count - 1;
      }
    }, {
      key: "even",
      get: function get() {
        return this.index % 2 === 0;
      }
    }, {
      key: "odd",
      get: function get() {
        return !this.even;
      }
    }]);

    return ForItem;
  }(Context);

  var ForStructure =
  /*#__PURE__*/
  function (_Structure) {
    _inheritsLoose(ForStructure, _Structure);

    function ForStructure() {
      return _Structure.apply(this, arguments) || this;
    }

    var _proto = ForStructure.prototype;

    _proto.onInit = function onInit() {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var forbegin = this.forbegin = document.createComment("*for begin");
      node.parentNode.replaceChild(forbegin, node);
      var forend = this.forend = document.createComment("*for end");
      forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
      var expression = node.getAttribute('*for');
      node.removeAttribute('*for');
      var tokens = this.tokens = this.getExpressionTokens(expression);
      this.forFunction = module.makeFunction(tokens.iterable);
      this.instances = [];
    };

    _proto.onState = function onState(state) {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node; // resolve

      var tokens = this.tokens;
      var result = module.resolve(this.forFunction, state, this) || [];
      var isArray = Array.isArray(result);
      var array = isArray ? result : Object.keys(result);
      var total = array.length;
      var previous = this.instances.length;
      var nextSibling = this.forbegin.nextSibling;

      for (var i = 0; i < Math.max(previous, total); i++) {
        if (i < total) {
          var key = isArray ? i : array[i];
          var value = isArray ? array[key] : result[key];

          if (i < previous) {
            // update
            var clonedNode = nextSibling;
            var instance = this.instances[i];
            instance[tokens.key] = key;
            instance[tokens.value] = value;
            instance.pushState();
            module.parse(clonedNode, instance);
            nextSibling = nextSibling.nextSibling;
          } else {
            // create
            var _clonedNode = node.cloneNode(true);

            this.forend.parentNode.insertBefore(_clonedNode, this.forend);
            var args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?

            var _instance = module.makeInstance(_clonedNode, ForItem, context.selector, context.parentInstance, args);

            var forItemContext = Module.getContext(_instance); // const instance = new ForItem(tokens.key, key, tokens.value, value, i, total, context.parentInstance);
            // const forItemContext = module.makeContext(instance, context.parentInstance, clonedNode, context.selector);

            var instances = module.compile(_clonedNode, forItemContext);
            console.log(instances.length, instances.filter(function (x) {
              return x.constructor instanceof Component;
            }).length);
            module.parse(_clonedNode, _instance);
            nextSibling = _clonedNode.nextSibling;
            this.instances.push(_instance);
          }
        } else {
          // remove
          var _instance2 = this.instances[i];

          var _context = Module.getContext(_instance2);

          var _node = _context.node;

          _node.parentNode.removeChild(_node);

          module.remove(_node);
        }
      }

      this.instances.length = array.length; // console.log(this.instances, tokens);
    };

    _proto.getExpressionTokens = function getExpressionTokens(expression) {
      if (expression === null) {
        throw 'invalid for';
      }

      if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
        throw 'invalid for';
      }

      var expressions = expression.split(';').map(function (x) {
        return x.trim();
      }).filter(function (x) {
        return x !== '';
      });
      var forExpressions = expressions[0].split(' of ').map(function (x) {
        return x.trim();
      });
      var value = forExpressions[0].replace(/\s*let\s*/, '');
      var iterable = forExpressions[1];
      var key = 'index';
      var keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);

      if (keyValueMatches) {
        key = keyValueMatches[1];
        value = keyValueMatches[2];
      }

      if (expressions.length > 1) {
        var indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(function (x) {
          return x.trim();
        });

        if (indexExpressions.length === 3) {
          key = indexExpressions[1];
        }
      }

      return {
        key: key,
        value: value,
        iterable: iterable
      };
    }
    /*
    onState_unoptimized(state) {
    	const context = Module.getContext(this);
    	const module = context.module;
    	const node = context.node;
    	const tokens = this.tokens;
    	while (this.forbegin.nextSibling !== this.forend) {
    		const nextSibling = this.forbegin.nextSibling;
    		this.forbegin.parentNode.removeChild(nextSibling);
    		module.remove(nextSibling);
    	}
    	const array = module.resolve(this.forFunction, state, this).map((value, index, array) => {
    		const item = new ForItem(tokens.key, index, tokens.value, value, array, this.parent);
    		const clonedNode = node.cloneNode(true);
    		this.forend.parentNode.insertBefore(clonedNode, this.forend);
    		const instances = module.compile(clonedNode, item);
    		module.parse(clonedNode, item);
    		return item;
    	});
    	// console.log('ForStructure.onState', array);
    }
    */
    ;

    return ForStructure;
  }(Structure);
  ForStructure.meta = {
    selector: '[*for]'
  };

  var IfStructure =
  /*#__PURE__*/
  function (_Structure) {
    _inheritsLoose(IfStructure, _Structure);

    function IfStructure() {
      return _Structure.apply(this, arguments) || this;
    }

    var _proto = IfStructure.prototype;

    _proto.onInit = function onInit() {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var ifbegin = this.ifbegin = document.createComment("*if begin");
      node.parentNode.replaceChild(ifbegin, node);
      var ifend = this.ifend = document.createComment("*if end");
      ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
      var expression = node.getAttribute('*if');
      this.expression = expression;
      this.ifFunction = module.makeFunction(expression);
      var clonedNode = node.cloneNode(true);
      clonedNode.removeAttribute('*if');
      this.clonedNode = clonedNode; // console.log('expression', expression);
    };

    _proto.onState = function onState(state) {
      var context = Module.getContext(this);
      var module = context.module; // console.log('IfStructure.onState', state, this.expression);

      var value = module.resolve(this.ifFunction, state, this);

      if (value) {
        if (!this.clonedNode.parentNode) {
          this.ifend.parentNode.insertBefore(this.clonedNode, this.ifend);
          module.compile(this.clonedNode);
          module.parse(this.clonedNode, state);
        }
      } else {
        if (this.clonedNode.parentNode) {
          this.clonedNode.parentNode.removeChild(this.clonedNode);
          module.remove(this.clonedNode);
        }
      }
    };

    return IfStructure;
  }(Structure);
  IfStructure.meta = {
    selector: '[*if]'
  };

  var InnerHtmlDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(InnerHtmlDirective, _Directive);

    function InnerHtmlDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = InnerHtmlDirective.prototype;

    _proto.onInit = function onInit() {
      var context = Module.getContext(this);
      var node = context.node;
      var selector = context.selector;
      var key = selector.replace(/\[(.+)\]/, function () {
        return arguments.length <= 1 ? undefined : arguments[1];
      });
      var expression = node.getAttribute(key);

      if (!expression) {
        throw "invalid " + key;
      }

      if (key === '[innerHTML]') {
        expression = "{{" + expression + "}}";
      }

      this.innerHtmlExpression = expression;
      console.log('InnerHtmlDirective.onInit', node, expression, key);
    };

    _proto.onState = function onState(state) {
      var context = Module.getContext(this);
      var innerHTML = context.module.evaluate(this.innerHtmlExpression, state);
      var node = context.node;
      node.innerHTML = innerHTML; // console.log('InnerHtmlDirective.onState', innerHTML);
    };

    return InnerHtmlDirective;
  }(Directive);
  InnerHtmlDirective.meta = {
    selector: "[[innerHTML]],[innerHTML]"
  };

  var JsonPipe =
  /*#__PURE__*/
  function () {
    function JsonPipe() {}

    JsonPipe.transform = function transform(value) {
      return JSON.stringify(value);
    };

    return JsonPipe;
  }();
  JsonPipe.meta = {
    name: 'json'
  };

  var StyleDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(StyleDirective, _Directive);

    function StyleDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = StyleDirective.prototype;

    _proto.onInit = function onInit() {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var expression = node.getAttribute('[style]');
      this.styleFunction = module.makeFunction(expression); // console.log('StyleDirective.onInit', expression);
    };

    _proto.onState = function onState(state) {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node;
      var style = module.resolve(this.styleFunction, state, this);
      Object.keys(style).forEach(function (key) {
        node.style[key] = style[key];
      }); // console.log('StyleDirective.onState', state, style);
    };

    return StyleDirective;
  }(Directive);
  StyleDirective.meta = {
    selector: "[[style]]"
  };

  var LocalStorageService =
  /*#__PURE__*/
  function () {
    function LocalStorageService() {}

    LocalStorageService.delete = function _delete(name) {
      if (this.isLocalStorageSupported()) {
        window.localStorage.removeItem(name);
      }
    };

    LocalStorageService.exist = function exist(name) {
      if (this.isLocalStorageSupported()) {
        return window.localStorage[name] !== undefined;
      }
    };

    LocalStorageService.get = function get(name) {
      var value = null;

      if (this.isLocalStorageSupported() && window.localStorage[name] !== undefined) {
        try {
          value = JSON.parse(window.localStorage[name]);
        } catch (e) {
          console.log('LocalStorageService.get.error parsing', name, e);
        }
      }

      return value;
    };

    LocalStorageService.set = function set(name, value) {
      if (this.isLocalStorageSupported()) {
        try {
          var cache = [];
          var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value !== null) {
              if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
              }

              cache.push(value);
            }

            return value;
          });
          window.localStorage.setItem(name, json);
        } catch (e) {
          console.log('LocalStorageService.set.error serializing', name, value, e);
        }
      }
    };

    LocalStorageService.isLocalStorageSupported = function isLocalStorageSupported() {
      if (this.supported) {
        return true;
      }

      var supported = false;

      try {
        supported = 'localStorage' in window && window.localStorage !== null;

        if (supported) {
          window.localStorage.setItem('test', '1');
          window.localStorage.removeItem('test');
        } else {
          supported = false;
        }
      } catch (e) {
        supported = false;
      }

      this.supported = supported;
      return supported;
    };

    return LocalStorageService;
  }();

  var StoreService =
  /*#__PURE__*/
  function () {
    function StoreService() {}

    StoreService.set = function set(items) {
      LocalStorageService.set('items', items);
      return this.get$().next(items);
    };

    StoreService.get$ = function get$() {
      if (this.store$) {
        return this.store$;
      }

      var items = LocalStorageService.get('items');

      if (!items) {
        items = [{
          id: 3,
          name: 'cookies',
          date: new Date(Date.now())
        }, {
          id: 2,
          name: 'pizza',
          date: new Date(2019, 3, 22, 12)
        }, {
          id: 1,
          name: 'bread',
          date: new Date(2019, 0, 6, 12)
        }];
        LocalStorageService.set('items', items);
      }

      return this.store$ = new rxjs.BehaviorSubject(items);
    };

    StoreService.add$ = function add$(patch) {
      var item = Object.assign({
        id: Date.now(),
        date: new Date(Date.now())
      }, patch);
      var items = this.store$.getValue();
      items.unshift(item);
      this.set(items);
      return rxjs.of(item);
    };

    StoreService.patch$ = function patch$(patch) {
      var items = this.store$.getValue();
      var item = items.find(function (x) {
        return x.id === patch.id;
      });

      if (item) {
        Object.assign(item, patch);
        this.set(items);
      }

      return rxjs.of(item);
    };

    StoreService.delete$ = function delete$(item) {
      var items = this.store$.getValue();
      var index = items.indexOf(item);

      if (index !== -1) {
        items.splice(index, 1);
        this.set(items);
      }

      return rxjs.of(item);
    };

    return StoreService;
  }();

  var AppComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(AppComponent, _Component);

    function AppComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = AppComponent.prototype;

    _proto.onInit = function onInit() {
      var _this = this;

      var context = Module.getContext(this);
      this.input = context.node.querySelector('.control--text');
      this.items = [];
      this.store$ = StoreService.get$();
      this.store$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
        // console.log('AppComponent.store$', items);
        _this.items = items;

        _this.pushState();
      });
      /*
      this.input$().pipe(
      	takeUntil(this.unsubscribe$)
      ).subscribe(input => {
      	// console.log(input);
      	this.input = input;
      });
      */
      // console.log('AppComponent', Object.keys(this).join(','));
    }
    /*
    input$() {
    	const context = Module.getContext(this);
    	const input = context.node.querySelector('.control--text');
    	return fromEvent(input, 'input').pipe(
    		map(event => input.value),
    		auditTime(200),
    		distinctUntilChanged()
    	);
    }
    */
    ;

    _proto.onInput = function onInput($event) {
      // console.log('AppComponent.onInput', $event, this);
      this.pushState();
    };

    _proto.onAddItem = function onAddItem($event) {
      var _this2 = this;

      if (this.input.value) {
        StoreService.add$({
          name: this.input.value
        }).subscribe(function (item) {
          // console.log('AppComponent.onAddItem', item);
          _this2.input.value = null;
        });
      }
    };

    _proto.onToggleItem = function onToggleItem(item) {
      StoreService.patch$({
        id: item.id,
        done: !item.done
      }).subscribe(function (item) {// console.log('AppComponent.onToggleItem', item);
      });
    };

    _proto.onRemoveItem = function onRemoveItem(item) {
      StoreService.delete$(item).subscribe(function (item) {// console.log('AppComponent.onRemoveItem', item);
      });
    };

    return AppComponent;
  }(Component);
  AppComponent.meta = {
    selector: '[app-component]'
  };

  var DatePipe =
  /*#__PURE__*/
  function () {
    function DatePipe() {}

    DatePipe.transform = function transform(value, locale, options) {
      if (locale === void 0) {
        locale = 'it-IT-u-ca-gregory';
      }

      if (options === void 0) {
        options = {
          dateStyle: 'short',
          timeStyle: 'short'
        };
      }

      return new Date(value).toLocaleDateString(locale, options);
    };

    return DatePipe;
  }();
  DatePipe.meta = {
    name: 'date'
  };

  var colors = [{
    hex: '#073B4C'
  }, {
    hex: '#EF476F'
  }, {
    hex: '#1CCC9D'
  }, {
    hex: '#118AB2'
  }, {
    hex: '#EFC156'
  }];
  function color(index, alpha) {
    return hexToRgb(colors[index % colors.length].hex, alpha);
  }
  function hexToRgb(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);

    if (a) {
      return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    } else {
      return "rgb(" + r + "," + g + "," + b + ")";
    }
  }

  var TodoItemComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(TodoItemComponent, _Component);

    function TodoItemComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = TodoItemComponent.prototype;

    _proto.onState = function onState(state) {
      // console.log('onState', state);
      this.backgroundColor = color(this.item.id, 0.15);
      this.color = color(this.item.id);
    };

    _proto.onToggle = function onToggle($event) {
      // console.log('onToggle', $event);
      this.toggle.next($event);
    };

    _proto.onRemove = function onRemove($event) {
      // console.log('onRemove', $event);
      this.remove.next($event);
    };

    return TodoItemComponent;
  }(Component);
  TodoItemComponent.meta = {
    selector: '[todo-item-component]',
    inputs: ['item'],
    outputs: ['toggle', 'remove'],
    template:
    /* html */
    "\n\t\t<button type=\"button\" class=\"btn--toggle\" [style]=\"{ color: color }\" (click)=\"onToggle(item)\">\n\t\t\t<i class=\"icon--check\" *if=\"item.done\"></i>\n\t\t\t<i class=\"icon--circle\" *if=\"!item.done\"></i>\n\t\t</button>\n\t\t<div class=\"title\" [style]=\"{ color: color }\" [innerHTML]=\"item.name\"></div>\n\t\t<div class=\"date\" [style]=\"{ background: backgroundColor, color: color }\" [innerHTML]=\"item.date | date : 'en-US' : { month: 'short', day: '2-digit', year: 'numeric' }\"></div>\n\t\t<button type=\"button\" class=\"btn--remove\" [style]=\"{ color: color }\" (click)=\"onRemove(item)\"><i class=\"icon--remove\"></i></button>\n\t"
  };

  Module.use$({
    factories: [ClassDirective, EventDirective, ForStructure, IfStructure, InnerHtmlDirective, StyleDirective, TodoItemComponent],
    pipes: [DatePipe, JsonPipe],
    bootstrap: AppComponent
  }).subscribe(function (createdInstances) {// console.log('createdInstances', createdInstances);
  });

})));
