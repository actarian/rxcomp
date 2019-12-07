/**
 * @license rxcomp v1.0.0-alpha.10
 * (c) 2019 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('rxjs'), require('rxjs/operators')) :
  typeof define === 'function' && define.amd ? define('test.for', ['rxjs', 'rxjs/operators'], factory) :
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

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var Directive = function Directive() {};

  var Component = function Component() {};

  var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];

  var Context =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(Context, _Component);

    function Context(instance, descriptors) {
      var _this;

      if (descriptors === void 0) {
        descriptors = {};
      }

      _this = _Component.call(this) || this;
      descriptors = Context.mergeDescriptors(instance, instance, descriptors);
      descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
      /*
      const subjects = {
      	changes$: {
      		value: new BehaviorSubject(this),
      		writable: false,
      		enumerable: false,
      	},
      	unsubscribe$: {
      		value: new Subject(),
      		writable: false,
      		enumerable: false,
      	}
      };
      */

      Object.defineProperties(_assertThisInitialized(_this), descriptors);
      return _this;
    }

    Context.mergeDescriptors = function mergeDescriptors(source, instance, descriptors) {
      if (descriptors === void 0) {
        descriptors = {};
      }

      var properties = Object.getOwnPropertyNames(source);

      var _loop = function _loop() {
        var key = properties.shift();

        if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
          // console.log('Context.mergeDescriptors', key, source[key]);
          var descriptor = Object.getOwnPropertyDescriptor(source, key);

          if (typeof descriptor.value == "function") {
            descriptor.value = function () {
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              instance[key].apply(instance, args);
            };
          }

          descriptors[key] = descriptor;
        }
      };

      while (properties.length) {
        _loop();
      }

      return descriptors;
    };

    return Context;
  }(Component);

  var ID = 0;
  var CONTEXTS = {};
  var NODES = {};
  var REMOVED_IDS = [];

  var Module =
  /*#__PURE__*/
  function () {
    function Module() {}

    var _proto = Module.prototype;

    _proto.compile = function compile(node, parentInstance) {
      var _this = this;

      var componentNode;
      var instances = Module.querySelectorsAll(node, this.meta.selectors, []).map(function (match) {
        if (componentNode && componentNode !== match.node) {
          parentInstance = undefined;
        }

        var instance = _this.makeInstance(match.node, match.factory, match.selector, parentInstance);

        if (match.factory.prototype instanceof Component) {
          componentNode = match.node;
        }

        return instance;
      }).filter(function (x) {
        return x;
      }); // console.log('compile', instances, node, parentInstance);

      return instances;
    };

    _proto.makeInstance = function makeInstance(node, factory, selector, parentInstance, args) {
      var _this2 = this;

      if (parentInstance || node.parentNode) {
        var isComponent = factory.prototype instanceof Component;
        var meta = factory.meta; // collect parentInstance scope

        parentInstance = parentInstance || this.getParentInstance(node.parentNode);

        if (!parentInstance) {
          return;
        } // creating factory instance


        var instance = _construct(factory, args || []); // creating instance context


        var context = Module.makeContext(this, instance, parentInstance, node, factory, selector); // injecting changes$ and unsubscribe$ subjects

        Object.defineProperties(instance, {
          changes$: {
            value: new rxjs.BehaviorSubject(instance),
            writable: false,
            enumerable: false
          },
          unsubscribe$: {
            value: new rxjs.Subject(),
            writable: false,
            enumerable: false
          }
        });
        var initialized; // injecting instance pushChanges method

        var module = this;

        instance.pushChanges = function () {
          // console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
          this.changes$.next(this); // parse component text nodes

          if (isComponent) {
            // console.log('Module.parse', instance.constructor.name);
            initialized ? module.parse(node, instance) : setTimeout(function () {
              module.parse(node, instance);
            });
          } // calling onView event


          if (typeof instance.onView === 'function') {
            // console.log('onView', instance.constructor.name);
            instance.onView();
          }
        }; // creating component input and outputs
        // if (isComponent && meta) {


        if (meta) {
          this.makeHosts(meta, instance, node);
          context.inputs = this.makeInputs(meta, instance);
          context.outputs = this.makeOutputs(meta, instance);
        } // calling onInit event


        if (typeof instance.onInit === 'function') {
          instance.onInit();
        }

        initialized = true; // subscribe to parent changes

        if (parentInstance.changes$) {
          parentInstance.changes$.pipe( // filter(() => node.parentNode),
          // debounceTime(1),
          operators.takeUntil(instance.unsubscribe$)).subscribe(function (changes) {
            // resolve component input outputs
            // if (isComponent && meta) {
            if (meta) {
              _this2.resolveInputsOutputs(instance, changes);
            } // calling onChanges event with parentInstance


            if (typeof instance.onChanges === 'function') {
              // console.log('onChanges', instance.constructor.name);
              // console.log('onChanges', instance.constructor.meta.selector, changes);
              instance.onChanges(changes);
            } // push instance changes for subscribers


            instance.pushChanges();
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

    _proto.makeContext = function makeContext(instance, parentInstance, node, selector) {
      var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector); // console.log('Module.makeContext', context, context.instance, context.node);

      return context;
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

      var args = params.join(',');
      var pipes = this.meta.pipes;
      var transforms = Module.getPipesSegments(expression);
      expression = transforms.shift().trim();
      expression = this.transformOptionalChaining(expression); // console.log(pipes, transforms, expression);
      // console.log(transforms.length, params);
      // keyword 'this' represents changes from func.apply(changes, instance)

      if (transforms.length) {
        expression = transforms.reduce(function (expression, transform, i) {
          var params = Module.getPipeParamsSegments(transform);
          var name = params.shift().trim();
          var pipe = pipes[name];

          if (!pipe || typeof pipe.transform !== 'function') {
            throw "missing pipe '" + name + "'";
          }

          return "$$pipes." + name + ".transform(" + expression + "," + params.join(',') + ")";
        }, expression); // console.log('expression', expression);

        var expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + args + ", $$module) {\n\t\t\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");
        return expression_func;
      } else {
        // console.log('expression', args, expression);
        // console.log('${expression.replace(/\'/g,'"')}', this);
        var _expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + args + ", $$module) {\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");

        return _expression_func;
      }
    };

    _proto.makeInput = function makeInput(instance, key) {
      var _getContext = getContext(instance),
          node = _getContext.node;

      var input,
          expression = null;

      if (node.hasAttribute(key)) {
        expression = "'" + node.getAttribute(key) + "'";
      } else if (node.hasAttribute("[" + key + "]")) {
        expression = node.getAttribute("[" + key + "]");
      }

      if (expression !== null) {
        input = this.makeFunction(expression);
      }

      return input;
    };

    _proto.makeOutput = function makeOutput(instance, key) {
      var _this3 = this;

      var context = getContext(instance);
      var node = context.node;
      var parentInstance = context.parentInstance;
      var expression = node.getAttribute("(" + key + ")");
      var outputFunction = this.makeFunction(expression, ['$event']);
      var output$ = new rxjs.Subject().pipe(operators.tap(function (event) {
        _this3.resolve(outputFunction, parentInstance, event);
      }));
      output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
      instance[key] = output$;
      return outputFunction;
    };

    _proto.getInstance = function getInstance(node) {
      if (node === document) {
        return window;
      }

      var context = getContextByNode(node);

      if (context) {
        return context.instance;
      }
    };

    _proto.getParentInstance = function getParentInstance(node) {
      var _this4 = this;

      return Module.traverseUp(node, function (node) {
        return _this4.getInstance(node);
      });
    };

    _proto.remove = function remove(node) {
      Module.traverseDown(node, function (node) {
        for (var id in CONTEXTS) {
          var context = CONTEXTS[id];

          if (context.node === node) {
            var instance = context.instance;
            instance.unsubscribe$.next();
            instance.unsubscribe$.complete();

            if (typeof instance.onDestroy === 'function') {
              instance.onDestroy();
            }

            delete node.dataset.rxcompId;
            REMOVED_IDS.push(id);
          }
        }
      }); // console.log('Module.remove', REMOVED_IDS);

      while (REMOVED_IDS.length) {
        Module.deleteContext(REMOVED_IDS.shift());
      }

      return node;
    };

    _proto.destroy = function destroy() {
      this.remove(this.meta.node);
      this.meta.node.innerHTML = this.meta.nodeInnerHTML;
    };

    _proto.evaluate = function evaluate(text, instance) {
      var _this5 = this;

      var parse_eval_ = function parse_eval_() {
        var expression = arguments.length <= 1 ? undefined : arguments[1]; // console.log('expression', expression);

        try {
          var parse_func_ = _this5.makeFunction(expression);

          return _this5.resolve(parse_func_, instance, instance);
        } catch (e) {
          console.error(e);
          return e.message;
        }
      };

      return text.replace(/\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g, parse_eval_); // return text.replace(/\{{2}((([^{}])|(\{[^{}]+?\}))*?)\}{2}/g, parse_eval_);
    };

    _proto.parse = function parse(node, instance) {
      // console.log('parse', instance.constructor.name, node);
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];

        if (child.nodeType === 1) {
          var context = getContextByNode(child);

          if (!context) {
            this.parse(child, instance);
          }
        } else if (child.nodeType === 3) {
          var expression = child.nodeExpression || child.nodeValue;
          var replacedText = this.evaluate(expression, instance);

          if (expression !== replacedText) {
            var textNode = document.createTextNode(replacedText);
            textNode.nodeExpression = expression;
            node.replaceChild(textNode, child);
          }
        }
      }
    };

    _proto.resolve = function resolve(expressionFunc, changes, payload) {
      return expressionFunc.apply(changes, [payload, this]);
    };

    _proto.makeHosts = function makeHosts(meta, instance, node) {
      if (meta.hosts) {
        Object.keys(meta.hosts).forEach(function (key) {
          var factory = meta.hosts[key];
          instance[key] = getHost(instance, factory, node);
        });
      }
    };

    _proto.makeInputs = function makeInputs(meta, instance) {
      var _this6 = this;

      var inputs = {};

      if (meta.inputs) {
        meta.inputs.forEach(function (key, i) {
          var input = _this6.makeInput(instance, key);

          if (input) {
            inputs[key] = input;
          }
        });
      }

      return inputs;
    };

    _proto.makeOutputs = function makeOutputs(meta, instance) {
      var _this7 = this;

      var outputs = {};

      if (meta.outputs) {
        meta.outputs.forEach(function (key, i) {
          return outputs[key] = _this7.makeOutput(instance, key);
        });
      }

      return outputs;
    };

    _proto.resolveInputsOutputs = function resolveInputsOutputs(instance, changes) {
      var context = getContext(instance);
      var parentInstance = context.parentInstance;
      var inputs = context.inputs;

      for (var key in inputs) {
        var inputFunction = inputs[key];
        var value = this.resolve(inputFunction, parentInstance, instance);
        instance[key] = value;
      }
      /*
      const outputs = context.outputs;
      for (let key in outputs) {
      	const inpuoutputFunctiontFunction = outputs[key];
      	const value = this.resolve(outputFunction, parentInstance, null);
      	// console.log(`setted -> ${key}`, value);
      }
      */

    };

    _proto.transformOptionalChaining = function transformOptionalChaining(expression) {
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

    Module.matchSelectors = function matchSelectors(node, selectors, results) {
      for (var i = 0; i < selectors.length; i++) {
        var match = selectors[i](node);

        if (match) {
          var factory = match.factory;

          if (factory.prototype instanceof Component && factory.meta.template) {
            node.innerHTML = factory.meta.template;
          }

          results.push(match);
        }
      }

      return results;
    };

    Module.querySelectorsAll = function querySelectorsAll(node, selectors, results) {
      if (node.nodeType === 1) {
        results = this.matchSelectors(node, selectors, results);
        var childNodes = node.childNodes;

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
      var rxcompNodeId = node.dataset.rxcompId = node.dataset.rxcompId || instance.rxcompId;
      var nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
      nodeContexts.push(context);
      return CONTEXTS[instance.rxcompId] = context;
    };

    Module.deleteContext = function deleteContext(id) {
      var context = CONTEXTS[id];
      var nodeContexts = NODES[context.node.dataset.rxcompId];

      if (nodeContexts) {
        var index = nodeContexts.indexOf(context);

        if (index !== -1) {
          nodeContexts.splice(index, 1);
        }
      }

      delete CONTEXTS[id];
    };

    return Module;
  }();
  function getContext(instance) {
    return CONTEXTS[instance.rxcompId];
  }
  function getContextByNode(node) {
    var context;
    var nodeContexts = NODES[node.dataset.rxcompId];

    if (nodeContexts) {
      /*
      const same = nodeContexts.reduce((p, c) => {
      	return p && c.node === node;
      }, true);
      console.log('same', same);
      */
      context = nodeContexts.reduce(function (previous, current) {
        if (current.factory.prototype instanceof Component) {
          return current;
        } else if (current.factory.prototype instanceof Context) {
          return previous ? previous : current;
        } else {
          return previous;
        }
      }, null); // console.log(node.dataset.rxcompId, context);
    }

    return context;
  }
  function getHost(instance, factory, node) {
    if (!node) {
      node = getContext(instance).node;
    }

    if (!node.dataset) {
      return;
    }

    var nodeContexts = NODES[node.dataset.rxcompId];

    if (nodeContexts) {
      // console.log(nodeContexts);
      // let hasComponent;
      for (var i = 0; i < nodeContexts.length; i++) {
        var context = nodeContexts[i];

        if (context.instance !== instance) {
          // console.log(context.instance, instance);
          if (context.instance instanceof factory) {
            return context.instance;
          }
          /*
          else if (context.instance instanceof Component) {
          	hasComponent = true;
          }
          */

        }
      }
      /*
      if (hasComponent) {
      	return undefined;
      }
      */

    }

    if (node.parentNode) {
      return getHost(instance, factory, node.parentNode);
    }
  }

  var ClassDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(ClassDirective, _Directive);

    function ClassDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = ClassDirective.prototype;

    _proto.onInit = function onInit() {
      var context = getContext(this);
      var module = context.module;
      var node = context.node;
      var expression = node.getAttribute('[class]');
      this.classFunction = module.makeFunction(expression); // console.log('ClassDirective.onInit', this.classList, expression);
    };

    _proto.onChanges = function onChanges(changes) {
      var context = getContext(this);
      var module = context.module;
      var node = context.node;
      var classList = module.resolve(this.classFunction, changes, this);

      for (var key in classList) {
        classList[key] ? node.classList.add(key) : node.classList.remove(key);
      } // console.log('ClassDirective.onChanges', classList);

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
      var context = getContext(this);
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

  var ForItem =
  /*#__PURE__*/
  function (_Context) {
    _inheritsLoose(ForItem, _Context);

    // !!! try with payload options { key, $key, value, $value, index, count } or use onInit()
    function ForItem(key, $key, value, $value, index, count, parentInstance) {
      var _this;

      // console.log('ForItem', arguments);
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
      /*
      onDestroy() {
      	console.log('onDestroy');
      }
      */

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
      var context = getContext(this);
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

    _proto.onChanges = function onChanges(changes) {
      var context = getContext(this);
      var module = context.module;
      var node = context.node; // resolve

      var tokens = this.tokens;
      var result = module.resolve(this.forFunction, changes, this) || [];
      var isArray = Array.isArray(result);
      var array = isArray ? result : Object.keys(result);
      var total = array.length;
      var previous = this.instances.length; // let nextSibling = this.forbegin.nextSibling;

      for (var i = 0; i < Math.max(previous, total); i++) {
        if (i < total) {
          var key = isArray ? i : array[i];
          var value = isArray ? array[key] : result[key];

          if (i < previous) {
            // update
            var instance = this.instances[i];
            instance[tokens.key] = key;
            instance[tokens.value] = value;
            /*
            if (!nextSibling) {
            	const context = getContext(instance);
            	const node = context.node;
            	this.forend.parentNode.insertBefore(node, this.forend);
            } else {
            	nextSibling = nextSibling.nextSibling;
            }
            */
          } else {
            // create
            var clonedNode = node.cloneNode(true);
            delete clonedNode.dataset.rxcompId;
            this.forend.parentNode.insertBefore(clonedNode, this.forend);
            var args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance]; // !!! context.parentInstance unused?

            var _instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);

            var forItemContext = getContext(_instance); // console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);

            module.compile(clonedNode, forItemContext.instance); // nextSibling = clonedNode.nextSibling;

            this.instances.push(_instance);
          }
        } else {
          // remove
          var _instance2 = this.instances[i];

          var _context = getContext(_instance2);

          var _node = _context.node;

          _node.parentNode.removeChild(_node);

          module.remove(_node);
        }
      }

      this.instances.length = array.length; // console.log('ForStructure', this.instances, tokens);
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
    };

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
      var context = getContext(this);
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
      this.clonedNode = clonedNode; // console.log('IfStructure.expression', expression);
    };

    _proto.onChanges = function onChanges(changes) {
      var context = getContext(this);
      var module = context.module; // console.log('IfStructure.onChanges', changes, this.expression);

      var value = module.resolve(this.ifFunction, changes, this);

      if (value) {
        if (!this.clonedNode.parentNode) {
          this.ifend.parentNode.insertBefore(this.clonedNode, this.ifend);
          module.compile(this.clonedNode);
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
      var context = getContext(this);
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

      this.innerHtmlExpression = expression; // console.log('InnerHtmlDirective.onInit', node, expression, key);
    };

    _proto.onChanges = function onChanges(changes) {
      var context = getContext(this);
      var innerHTML = context.module.evaluate(this.innerHtmlExpression, changes); // console.log('InnerHtmlDirective.onChanges', this.innerHtmlExpression, innerHTML);

      var node = context.node;
      node.innerHTML = innerHTML;
    };

    return InnerHtmlDirective;
  }(Directive);
  InnerHtmlDirective.meta = {
    selector: "[[innerHTML]],[innerHTML]"
  };

  var Pipe =
  /*#__PURE__*/
  function () {
    function Pipe() {}

    Pipe.transform = function transform(value) {
      return value;
    };

    return Pipe;
  }();

  var JsonPipe =
  /*#__PURE__*/
  function (_Pipe) {
    _inheritsLoose(JsonPipe, _Pipe);

    function JsonPipe() {
      return _Pipe.apply(this, arguments) || this;
    }

    JsonPipe.transform = function transform(value) {
      return JSON.stringify(value);
    };

    return JsonPipe;
  }(Pipe);
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
      var context = getContext(this);
      var module = context.module;
      var node = context.node;
      var expression = node.getAttribute('[style]');
      this.styleFunction = module.makeFunction(expression); // console.log('StyleDirective.onInit', expression);
    };

    _proto.onChanges = function onChanges(changes) {
      var context = getContext(this);
      var module = context.module;
      var node = context.node;
      var style = module.resolve(this.styleFunction, changes, this);

      for (var key in style) {
        node.style.setProperty(key, style[key]);
      } // console.log('StyleDirective.onChanges', changes, style);

    };

    return StyleDirective;
  }(Directive);
  StyleDirective.meta = {
    selector: "[[style]]"
  };

  var CoreModule =
  /*#__PURE__*/
  function (_Module) {
    _inheritsLoose(CoreModule, _Module);

    function CoreModule() {
      return _Module.apply(this, arguments) || this;
    }

    return CoreModule;
  }(Module);
  var factories = [ClassDirective, EventDirective, ForStructure, IfStructure, InnerHtmlDirective, StyleDirective, JsonPipe];
  var pipes = [JsonPipe];
  CoreModule.meta = {
    declarations: [].concat(factories, pipes),
    exports: [].concat(factories, pipes)
  };

  var ORDER = [Structure, Component, Directive];

  var Platform =
  /*#__PURE__*/
  function () {
    function Platform() {}

    Platform.bootstrap = function bootstrap(moduleFactory) {
      var meta = this.resolveMeta(moduleFactory);
      var bootstrap = meta.bootstrap;

      if (!bootstrap) {
        throw 'missing bootstrap';
      }

      var node = meta.node = this.querySelector(bootstrap.meta.selector);

      if (!node) {
        throw "missing node " + bootstrap.meta.selector;
      }

      meta.nodeInnerHTML = node.innerHTML;
      var pipes = meta.pipes = this.resolvePipes(meta);
      var factories = meta.factories = this.resolveFactories(meta);
      this.sortFactories(factories);
      factories.unshift(bootstrap);
      var selectors = meta.selectors = this.unwrapSelectors(factories);
      var module = new moduleFactory();
      module.meta = meta;
      var instances = module.compile(node, window);
      var root = instances[0]; // if (root instanceof module.meta.bootstrap) {

      root.pushChanges(); // }

      return module;
    };

    Platform.querySelector = function querySelector(selector) {
      return document.querySelector(selector);
    };

    Platform.resolveMeta = function resolveMeta(moduleFactory) {
      var _this = this;

      var meta = Object.assign({
        imports: [],
        declarations: [],
        pipes: [],
        exports: []
      }, moduleFactory.meta);
      meta.imports = meta.imports.map(function (moduleFactory) {
        return _this.resolveMeta(moduleFactory);
      });
      return meta;
    };

    Platform.resolvePipes = function resolvePipes(meta, exported) {
      var _this2 = this;

      var importedPipes = meta.imports.map(function (meta) {
        return _this2.resolvePipes(meta, true);
      });
      var pipes = {};
      var pipeList = (exported ? meta.exports : meta.declarations).filter(function (x) {
        return x.prototype instanceof Pipe;
      });
      pipeList.forEach(function (pipeFactory) {
        return pipes[pipeFactory.meta.name] = pipeFactory;
      });
      return Object.assign.apply(Object, [{}].concat(importedPipes, [pipes]));
    };

    Platform.resolveFactories = function resolveFactories(meta, exported) {
      var _this3 = this,
          _Array$prototype$conc;

      var importedFactories = meta.imports.map(function (meta) {
        return _this3.resolveFactories(meta, true);
      });
      var factoryList = (exported ? meta.exports : meta.declarations).filter(function (x) {
        return x.prototype instanceof Structure || x.prototype instanceof Component || x.prototype instanceof Directive;
      });
      return (_Array$prototype$conc = Array.prototype.concat).call.apply(_Array$prototype$conc, [factoryList].concat(importedFactories));
    };

    Platform.sortFactories = function sortFactories(factories) {
      factories.sort(function (a, b) {
        var ai = ORDER.reduce(function (p, c, i) {
          return a.prototype instanceof c ? i : p;
        }, -1);
        var bi = ORDER.reduce(function (p, c, i) {
          return b.prototype instanceof c ? i : p;
        }, -1); // return ai - bi;

        var o = ai - bi;

        if (o === 0) {
          return (a.meta.hosts ? 1 : 0) - (b.meta.hosts ? 1 : 0);
        }

        return o;
      });
    };

    Platform.getExpressions = function getExpressions(selector) {
      var matchers = [];
      selector.replace(/\.([\w\-\_]+)|\[(.+?\]*)(\=)(.*?)\]|\[(.+?\]*)\]|([\w\-\_]+)/g, function (value, c1, a2, u3, v4, a5, e6) {
        if (c1) {
          matchers.push(function (node) {
            return node.classList.contains(c1);
          });
        }

        if (a2) {
          matchers.push(function (node) {
            return node.hasAttribute(a2) && node.getAttribute(a2) === v4;
          });
        }

        if (a5) {
          matchers.push(function (node) {
            return node.hasAttribute(a5);
          });
        }

        if (e6) {
          matchers.push(function (node) {
            return node.nodeName.toLowerCase() === e6.toLowerCase();
          });
        }
      });
      return matchers;
    };

    Platform.unwrapSelectors = function unwrapSelectors(factories) {
      var _this4 = this;

      var selectors = [];
      factories.forEach(function (factory) {
        factory.meta.selector.split(',').forEach(function (selector) {
          selector = selector.trim();
          var excludes = [];
          var matchSelector = selector.replace(/\:not\((.+?)\)/g, function (value, unmatchSelector) {
            excludes = _this4.getExpressions(unmatchSelector);
            return '';
          });

          var includes = _this4.getExpressions(matchSelector);

          selectors.push(function (node) {
            var include = includes.reduce(function (result, e) {
              return result && e(node);
            }, true);
            var exclude = excludes.reduce(function (result, e) {
              return result || e(node);
            }, false);

            if (include && !exclude) {
              return {
                node: node,
                factory: factory,
                selector: selector
              };
            } else {
              return false;
            }
          });
        });
      });
      return selectors;
    };

    Platform.isBrowser = function isBrowser() {
      return window;
    } // static isServer() {}
    ;

    return Platform;
  }();

  var Browser =
  /*#__PURE__*/
  function (_Platform) {
    _inheritsLoose(Browser, _Platform);

    function Browser() {
      return _Platform.apply(this, arguments) || this;
    }

    return Browser;
  }(Platform);

  var RootComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(RootComponent, _Component);

    function RootComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = RootComponent.prototype;

    _proto.onInit = function onInit() {
      var _this = this;

      this.items = [1, 2, 3, 4];
      return rxjs.interval(50).pipe(operators.take(1000), operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
        _this.items = new Array(1 + Math.floor(Math.random() * 9)).fill(0).map(function (x, i) {
          return i + 1;
        });

        _this.pushChanges();
      });
    };

    return RootComponent;
  }(Component);

  RootComponent.meta = {
    selector: '[root-component]'
  }; // pipe

  var ExamplePipe =
  /*#__PURE__*/
  function (_Pipe) {
    _inheritsLoose(ExamplePipe, _Pipe);

    function ExamplePipe() {
      return _Pipe.apply(this, arguments) || this;
    }

    ExamplePipe.transform = function transform(value) {
      return value * 2;
    };

    return ExamplePipe;
  }(Pipe);

  ExamplePipe.meta = {
    name: 'example'
  };

  var AppModule =
  /*#__PURE__*/
  function (_Module) {
    _inheritsLoose(AppModule, _Module);

    function AppModule() {
      return _Module.apply(this, arguments) || this;
    }

    return AppModule;
  }(Module);

  AppModule.meta = {
    imports: [CoreModule],
    declarations: [ExamplePipe],
    bootstrap: RootComponent
  };
  var module = Browser.bootstrap(AppModule);

})));
