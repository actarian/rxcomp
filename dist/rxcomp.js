(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('rxjs/operators')) :
  typeof define === 'function' && define.amd ? define('rxcomp', ['exports', 'rxjs', 'rxjs/operators'], factory) :
  (global = global || self, factory(global.rxcomp = {}, global.rxjs, global.rxjs.operators));
}(this, (function (exports, rxjs, operators) { 'use strict';

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

  var Directive = function Directive() {};
  Directive.meta = {
    selector: '[(directive)]'
  };

  var Component = function Component() {};
  Component.meta = {
    selector: '[component]'
  };

  var ID = 0;
  var CONTEXTS = {};

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
      this.root = this.makeInstance(document.querySelector(bootstrap.meta.selector), bootstrap);
      this.selectors = Module.unwrapSelectors(options.factories);
    }

    var _proto = Module.prototype;

    _proto.use$ = function use$() {
      var _this = this;

      return rxjs.of(Module.querySelectorsAll(document, this.selectors, [])).pipe(operators.filter(function (matches) {
        return matches.length > 0;
      }), operators.map(function (matches) {
        return matches.map(function (match) {
          return _this.makeInstance(match.node, match.factory, match.selector);
        });
      }), operators.shareReplay(1));
    };

    _proto.makeInstance = function makeInstance(node, factory, selector, parentInstance) {
      var _this2 = this;

      if (node.parentNode) {
        var isComponent = factory.prototype instanceof Component;
        var meta = factory.meta;
        parentInstance = parentInstance || this.getParentScope(node.parentNode);

        if (!parentInstance) {
          return;
        }

        var instance = new factory();
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
        });

        instance.pushState = function () {
          this.state$.next(this);
        };

        var context = Module.setContext(this, instance, parentInstance, node, factory, selector);

        if (isComponent) {
          context.inputs = this.makeInputs(meta, instance);
          context.outputs = this.makeOutputs(meta, instance);
        }

        if (typeof instance.onInit === 'function') {
          instance.onInit();
        }

        if (parentInstance.state$) {
          parentInstance.state$.pipe( // filter(() => node.parentNode),
          operators.takeUntil(instance.unsubscribe$)).subscribe(function (state) {
            if (isComponent) {
              _this2.resolveInputsOutputs(instance, state);
            }

            _this2.pushState(instance, state);

            if (isComponent) {
              _this2.parse(node, instance);
            }
          });
        }

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
        return delete CONTEXTS[id];
      }); // console.log('Module.remove', ids);

      return node;
    };

    _proto.compile = function compile(node, parent) {
      var _this3 = this;

      if (parent) {
        var $id = ++ID;
        parent.$id = $id;
        var context = Module.setContext(this, parent, parent.parentInstance, node, parent.constructor);
      }

      var matches = Module.querySelectorsAll(node, this.selectors, []);
      var instances = matches.map(function (match) {
        var instance = _this3.makeInstance(match.node, match.factory, match.selector, parent);

        if (match.factory.prototype instanceof Component) {
          parent = undefined; // !!!
        }

        return instance;
      }).filter(function (x) {
        return x !== undefined;
      });
      return instances;
    };

    _proto.parse = function parse(node, instance) {
      var _this4 = this;

      // console.log('node', node.childNodes.length, node);
      var parse_eval_ = function parse_eval_() {
        var expression = arguments.length <= 1 ? undefined : arguments[1]; // console.log('expression', expression);

        var parse_func_ = _this4.makeFunction(expression);

        return _this4.resolve(parse_func_, instance, instance);
      };

      var parse_replace_ = function parse_replace_(text) {
        return text.replace(new RegExp('\{{2}(.*?)\}{2}(?!})', 'g'), parse_eval_);
      };

      if (node.hasAttribute('[innerHTML]')) {
        var innerHTML = "{{" + node.getAttribute('[innerHTML]') + "}}";
        node.innerHTML = parse_replace_(innerHTML);
      } else if (node.hasAttribute('innerHTML')) {
        var _innerHTML = node.getAttribute('innerHTML');

        node.innerHTML = parse_replace_(_innerHTML);
      } else {
        for (var i = 0; i < node.childNodes.length; i++) {
          var child = node.childNodes[i]; // console.log('node', child, child.nodeType);

          if (child.nodeType === 1) {
            // if (!has_scope_(child)) {
            // if (!child.hasAttribute(`instance`)) {
            this.parse(child, instance); // }
          } else if (child.nodeType === 3) {
            // console.log(child);
            var text = child.nodeValue;
            var replacedText = parse_replace_(text);

            if (text !== replacedText) {
              node.setAttribute('innerHTML', text);
              var textNode = document.createTextNode(replacedText);
              node.replaceChild(textNode, child);
            }
          }
        }
      }

      if (typeof instance.onParse === 'function') {
        scope.onParse();
      }
      /*
      const scope = this.getScope(node);
      if (scope) {
      	if (typeof instance.onParse === 'function') {
      		scope.onParse();
      	}
      }
      */

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

      var instance = Module.getComponentInstanceByNode(node);
      return instance;
    };

    _proto.getParentScope = function getParentScope(node) {
      var _this8 = this;

      return Module.traverseUp(node, function (node) {
        return _this8.getScope(node);
      });
    };

    _proto.pushState = function pushState(instance, state) {
      if (typeof instance.onState === 'function') {
        // console.log('onState', instance.constructor.meta.selector, state);
        instance.onState(state);
      }

      if (instance.state$) {
        instance.state$.next(instance);
      }
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
        var _expression_func = new Function(this.options.debug ? "with(this) {\n\t\t\t\treturn (function (" + params.join(',') + ") {\n\t\t\t\t\tlet value;\n\t\t\t\t\ttry {\n\t\t\t\t\t\tvalue = " + expression + ";\n\t\t\t\t\t} catch(e) {\n\t\t\t\t\t\tconsole.error(e);\n\t\t\t\t\t\tvalue = '<span style=\"color:red;\">' + e.message + ' in expression ' + expression + '</span>';\n\t\t\t\t\t}\n\t\t\t\t\treturn value;\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}" : "with(this) {\n\t\t\t\treturn (function (" + params.join(',') + ") {\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");

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
    } //
    ;

    _proto.contexts_ = function contexts_() {
      return CONTEXTS;
    } //
    ;

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
      return CONTEXTS[instance.$id];
    };

    Module.setContext = function setContext(module, instance, parentInstance, node, factory, selector) {
      var $id = ++ID;
      instance.$id = $id;
      return CONTEXTS[$id] = {
        module: module,
        instance: instance,
        parentInstance: parentInstance,
        node: node,
        factory: factory,
        selector: selector
      };
    };

    Module.getComponentInstanceByNode = function getComponentInstanceByNode(node) {
      var id = Object.keys(CONTEXTS).find(function (id) {
        return CONTEXTS[id].node === node && CONTEXTS[id].factory.prototype instanceof Component;
      });

      if (id) {
        var context = CONTEXTS[id];
        return context.instance;
      }
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

  var Context = function Context(parent, descriptors) {
    var _this = this;

    var parentPrototypeDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(parent));
    delete parentPrototypeDescriptors.constructor;
    Object.keys(parentPrototypeDescriptors).forEach(function (key) {
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
      var descriptor = parentDescriptors[key];

      if (typeof descriptor.value == "function") {
        descriptor.value = function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          parent[key].apply(parent, args);
        };
      }
    }); // console.log('parentDescriptors', parentDescriptors);

    Object.defineProperties(this, Object.assign(parentPrototypeDescriptors, parentDescriptors, {
      state$: {
        value: new rxjs.BehaviorSubject(this),
        writable: false,
        enumerable: false
      },
      unsubscribe$: {
        value: new rxjs.Subject(),
        writable: false,
        enumerable: false
      }
    }, descriptors));

    this.pushState = function () {
      _this.state$.next(_this);
    };
  };

  var ForItem =
  /*#__PURE__*/
  function (_Context) {
    _inheritsLoose(ForItem, _Context);

    function ForItem($key, $value, index, array, parentInstance) {
      var _Context$call;

      var _this;

      _this = _Context.call(this, parentInstance, (_Context$call = {}, _Context$call[$key] = {
        get: function get() {
          return this.$value;
        },
        set: function set(value) {
          this.$value = value;
        }
      }, _Context$call)) || this;
      _this.$key = $key;
      _this.$value = $value;
      _this.index = index;
      _this.count = array.length; // console.log(this);

      return _this;
    }

    var _proto = ForItem.prototype;

    _proto.pushState = function pushState() {
      this.state$.next(this);
    };

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

      if (expression === null) {
        throw 'invalid for';
      }

      if (expression.trim().indexOf('let') !== 0) {
        throw 'invalid for';
      }

      expression = expression.substr(3);
      expression = expression.split(' of ');
      var key = expression[0].trim();
      var data = expression[1].trim();
      this.forFunction = module.makeFunction(data);
      this.key = key;
      this.items = []; // console.log('expression', expression);
    };

    _proto.onState = function onState(state) {
      var context = Module.getContext(this);
      var module = context.module;
      var node = context.node; // resolve

      var items = module.resolve(this.forFunction, state, this) || [];
      var total = items.length;
      var previous = this.items.length;
      var nextSibling = this.forbegin.nextSibling;

      for (var i = 0; i < Math.max(previous, total); i++) {
        if (i < total) {
          var item = items[i];

          if (i < previous) {
            // update
            var clonedNode = nextSibling;
            var instance = this.items[i];
            instance[this.key] = item;
            instance.pushState();
            module.parse(clonedNode, instance);
            nextSibling = nextSibling.nextSibling;
          } else {
            // create
            var _clonedNode = node.cloneNode(true);

            this.forend.parentNode.insertBefore(_clonedNode, this.forend);

            var _instance = new ForItem(this.key, item, i, items, context.parentInstance);

            var instances = module.compile(_clonedNode, _instance);
            module.parse(_clonedNode, _instance);
            nextSibling = _clonedNode.nextSibling;
            this.items.push(_instance);
          }
        } else {
          // remove
          var _item = this.items[i];

          var _context = Module.getContext(_item);

          var _node = _context.node;

          _node.parentNode.removeChild(_node);

          module.remove(_node);
        }
      }

      this.items.length = items.length;
    }
    /*
    onState_unoptimized(state) {
    	const context = Module.getContext(this);
    	const module = context.module;
    	const node = context.node;
    	while (this.forbegin.nextSibling !== this.forend) {
    		const nextSibling = this.forbegin.nextSibling;
    		this.forbegin.parentNode.removeChild(nextSibling);
    		module.remove(nextSibling);
    	}
    	const items = module.resolve(this.forFunction, state, this).map((value, index, items) => {
    		const item = new ForItem(this.key, value, index, items, this.parent);
    		const clonedNode = node.cloneNode(true);
    		this.forend.parentNode.insertBefore(clonedNode, this.forend);
    		const instances = module.compile(clonedNode, item);
    		module.parse(clonedNode, item);
    		return item;
    	});
    	// console.log('ForStructure.onState', items);
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

  exports.ClassDirective = ClassDirective;
  exports.Component = Component;
  exports.Directive = Directive;
  exports.EventDirective = EventDirective;
  exports.ForStructure = ForStructure;
  exports.IfStructure = IfStructure;
  exports.JsonPipe = JsonPipe;
  exports.Module = Module;
  exports.Structure = Structure;
  exports.StyleDirective = StyleDirective;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
