/**
 * @license rxcomp v1.0.0-beta.5
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function (rxjs, operators) {
  'use strict';

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

  var Factory = function Factory() {};

  var Directive = function (_Factory) {
    _inheritsLoose(Directive, _Factory);

    function Directive() {
      return _Factory.apply(this, arguments) || this;
    }

    return Directive;
  }(Factory);

  var Component = function (_Factory) {
    _inheritsLoose(Component, _Factory);

    function Component() {
      return _Factory.apply(this, arguments) || this;
    }

    return Component;
  }(Factory);

  var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];

  var Context = function (_Component) {
    _inheritsLoose(Context, _Component);

    function Context(instance, descriptors) {
      var _this;

      if (descriptors === void 0) {
        descriptors = {};
      }

      _this = _Component.call(this) || this;
      descriptors = Context.mergeDescriptors(instance, instance, descriptors);
      descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
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
          var descriptor = Object.getOwnPropertyDescriptor(source, key);

          if (typeof descriptor.value == 'function') {
            descriptor.value = function () {
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              return instance[key].apply(instance, args);
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

  var Structure = function (_Factory) {
    _inheritsLoose(Structure, _Factory);

    function Structure() {
      return _Factory.apply(this, arguments) || this;
    }

    return Structure;
  }(Factory);

  var ID = 0;
  var CONTEXTS = {};
  var NODES = {};

  var Module = function () {
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
        return x != undefined;
      });
      return instances;
    };

    _proto.makeInstance = function makeInstance(node, factory, selector, parentInstance, args) {
      var _this2 = this;

      if (parentInstance || node.parentNode) {
        var isComponent = factory.prototype instanceof Component;
        var meta = factory.meta;
        parentInstance = parentInstance || this.getParentInstance(node.parentNode);

        if (!parentInstance) {
          return;
        }

        var instance = _construct(factory, args || []);

        var context = Module.makeContext(this, instance, parentInstance, node, factory, selector);
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
        var initialized;
        var module = this;

        instance.pushChanges = function () {
          this.changes$.next(this);

          if (isComponent) {
            initialized ? module.parse(node, instance) : setTimeout(function () {
              module.parse(node, instance);
            });
          }

          if (typeof instance['onView'] === 'function') {
            instance['onView']();
          }
        };

        if (meta) {
          this.makeHosts(meta, instance, node);
          context.inputs = this.makeInputs(meta, instance);
          context.outputs = this.makeOutputs(meta, instance);
        }

        if (typeof instance['onInit'] === 'function') {
          instance['onInit']();
        }

        initialized = true;

        if (parentInstance instanceof Factory && parentInstance.changes$) {
          parentInstance.changes$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe(function (changes) {
            if (meta) {
              _this2.resolveInputsOutputs(instance, changes);
            }

            if (typeof instance['onChanges'] === 'function') {
              instance['onChanges'](changes);
            }

            instance.pushChanges();
          });
        }

        return instance;
      }
    };

    _proto.makeContext = function makeContext(instance, parentInstance, node, selector) {
      var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
      return context;
    };

    _proto.makeFunction = function makeFunction(expression, params) {
      if (params === void 0) {
        params = ['$instance'];
      }

      if (expression) {
        expression = Module.parseExpression(expression);
        var args = params.join(',');
        var expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + args + ", $$module) {\n\t\t\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");
        return expression_func;
      } else {
        return function () {
          return null;
        };
      }
    };

    _proto.getInstance = function getInstance(node) {
      if (node instanceof Document) {
        return window;
      }

      var context = getContextByNode(node);

      if (context) {
        return context.instance;
      }
    };

    _proto.getParentInstance = function getParentInstance(node) {
      var _this3 = this;

      return Module.traverseUp(node, function (node) {
        return _this3.getInstance(node);
      });
    };

    _proto.parse = function parse(node, instance) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];

        if (child.nodeType === 1) {
          var element = child;
          var context = getContextByNode(element);

          if (!context) {
            this.parse(element, instance);
          }
        } else if (child.nodeType === 3) {
          var text = child;
          this.parseTextNode(text, instance);
        }
      }
    };

    _proto.parseTextNode = function parseTextNode(node, instance) {
      var _this4 = this;

      var expressions = node.nodeExpressions;

      if (!expressions) {
        expressions = this.parseTextNodeExpression(node.nodeValue);
      }

      var replacedText = expressions.reduce(function (p, c) {
        var text;

        if (typeof c === 'function') {
          text = _this4.resolve(c, instance, instance);

          if (text == undefined) {
            text = '';
          }
        } else {
          text = c;
        }

        return p + text;
      }, '');

      if (node.nodeValue !== replacedText) {
        var textNode = document.createTextNode(replacedText);
        textNode.nodeExpressions = expressions;
        node.parentNode.replaceChild(textNode, node);
      }
    };

    _proto.pushFragment = function pushFragment(nodeValue, from, to, expressions) {
      var fragment = nodeValue.substring(from, to);
      expressions.push(fragment);
    };

    _proto.parseTextNodeExpression = function parseTextNodeExpression(nodeValue) {
      var expressions = [];
      var regex = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
      var lastIndex = 0,
          matches;

      while ((matches = regex.exec(nodeValue)) !== null) {
        var index = regex.lastIndex - matches[0].length;

        if (index > lastIndex) {
          this.pushFragment(nodeValue, index, lastIndex, expressions);
        }

        lastIndex = regex.lastIndex;
        var expression = this.makeFunction(matches[1]);
        expressions.push(expression);
      }

      var length = nodeValue.length;

      if (length > lastIndex) {
        this.pushFragment(nodeValue, lastIndex, length, expressions);
      }

      return expressions;
    };

    _proto.resolve = function resolve(expression, parentInstance, payload) {
      return expression.apply(parentInstance, [payload, this]);
    };

    _proto.makeHosts = function makeHosts(meta, instance, node) {
      if (meta.hosts) {
        Object.keys(meta.hosts).forEach(function (key) {
          var factory = meta.hosts[key];
          instance[key] = getHost(instance, factory, node);
        });
      }
    };

    _proto.makeInput = function makeInput(instance, key) {
      var _getContext = getContext(instance),
          node = _getContext.node;

      var input,
          expression = null;

      if (node.hasAttribute("[" + key + "]")) {
        expression = node.getAttribute("[" + key + "]");
      } else if (node.hasAttribute(key)) {
        var attribute = node.getAttribute(key).replace(/({{)|(}})|(")/g, function (substring, a, b, c) {
          if (a) {
            return '"+';
          }

          if (b) {
            return '+"';
          }

          if (c) {
            return '\"';
          }
        });
        expression = "\"" + attribute + "\"";
      }

      if (expression !== null) {
        input = this.makeFunction(expression);
      }

      return input;
    };

    _proto.makeInputs = function makeInputs(meta, instance) {
      var _this5 = this;

      var inputs = {};

      if (meta.inputs) {
        meta.inputs.forEach(function (key, i) {
          var input = _this5.makeInput(instance, key);

          if (input) {
            inputs[key] = input;
          }
        });
      }

      return inputs;
    };

    _proto.makeOutput = function makeOutput(instance, key) {
      var _this6 = this;

      var context = getContext(instance);
      var node = context.node;
      var parentInstance = context.parentInstance;
      var expression = node.getAttribute("(" + key + ")");
      var outputFunction = this.makeFunction(expression, ['$event']);
      var output$ = new rxjs.Subject().pipe(operators.tap(function (event) {
        _this6.resolve(outputFunction, parentInstance, event);
      }));
      output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
      instance[key] = output$;
      return outputFunction;
    };

    _proto.makeOutputs = function makeOutputs(meta, instance) {
      var _this7 = this;

      var outputs = {};

      if (meta.outputs) {
        meta.outputs.forEach(function (key, i) {
          outputs[key] = _this7.makeOutput(instance, key);
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
    };

    _proto.destroy = function destroy() {
      this.remove(this.meta.node);
      this.meta.node.innerHTML = this.meta.nodeInnerHTML;
    };

    _proto.remove = function remove(node, keepInstance) {
      var keepContext = keepInstance ? getContext(keepInstance) : undefined;
      Module.traverseDown(node, function (node) {
        var rxcompId = node.rxcompId;

        if (rxcompId) {
          var keepContexts = Module.deleteContext(rxcompId, keepContext);

          if (keepContexts.length === 0) {
            delete node.rxcompId;
          }
        }
      });
      return node;
    };

    Module.parseExpression = function parseExpression(expression) {
      var l = '┌';
      var r = '┘';
      var rx1 = /(\()([^\(\)]*)(\))/;

      while (expression.match(rx1)) {
        expression = expression.replace(rx1, function (substring) {
          return "" + l + Module.parsePipes(arguments.length <= 2 ? undefined : arguments[2]) + r;
        });
      }

      expression = Module.parsePipes(expression);
      expression = expression.replace(/(┌)|(┘)/g, function (substring) {
        return (arguments.length <= 1 ? undefined : arguments[1]) ? '(' : ')';
      });
      return Module.parseOptionalChaining(expression);
    };

    Module.parsePipes = function parsePipes(expression) {
      var rx1 = /(.*?[^\|])\|([^\|]+)/;

      while (expression.match(rx1)) {
        expression = expression.replace(rx1, function (substring) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var value = args[0].trim();
          var params = Module.parsePipeParams(args[1]);
          var func = params.shift().trim();
          return "$$pipes." + func + ".transform\u250C" + [value].concat(params) + "\u2518";
        });
      }

      return expression;
    };

    Module.parsePipeParams = function parsePipeParams(expression) {
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
            segments.push(word.trim());
          }

          word = '';
        } else {
          word += c;
        }

        i++;
      }

      if (word.length) {
        segments.push(word.trim());
      }

      return segments;
    };

    Module.parseOptionalChaining = function parseOptionalChaining(expression) {
      var regex = /(\w+(\?\.))+([\.|\w]+)/g;
      var previous;
      expression = expression.replace(regex, function (substring) {
        var tokens = substring.split('?.');

        for (var i = 0; i < tokens.length - 1; i++) {
          var a = i > 0 ? "(" + tokens[i] + " = " + previous + ")" : tokens[i];
          var b = tokens[i + 1];
          previous = i > 0 ? a + "." + b : "(" + a + " ? " + a + "." + b + " : void 0)";
        }

        return previous || '';
      });
      return expression;
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
      var rxcompNodeId = node.rxcompId = node.rxcompId || instance.rxcompId;
      var nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
      nodeContexts.push(context);
      CONTEXTS[instance.rxcompId] = context;
      return context;
    };

    Module.deleteContext = function deleteContext(id, keepContext) {
      var keepContexts = [];
      var nodeContexts = NODES[id];

      if (nodeContexts) {
        nodeContexts.forEach(function (context) {
          if (context === keepContext) {
            keepContexts.push(keepContext);
          } else {
            var instance = context.instance;
            instance.unsubscribe$.next();
            instance.unsubscribe$.complete();

            if (typeof instance['onDestroy'] === 'function') {
              instance['onDestroy']();
              delete CONTEXTS[instance.rxcompId];
            }
          }
        });

        if (keepContexts.length) {
          NODES[id] = keepContexts;
        } else {
          delete NODES[id];
        }
      }

      return keepContexts;
    };

    Module.matchSelectors = function matchSelectors(node, selectors, results) {
      for (var i = 0; i < selectors.length; i++) {
        var selectorResult = selectors[i](node);

        if (selectorResult) {
          var factory = selectorResult.factory;

          if (factory.prototype instanceof Component && factory.meta.template) {
            node.innerHTML = factory.meta.template;
          }

          results.push(selectorResult);

          if (factory.prototype instanceof Structure) {
            break;
          }
        }
      }

      return results;
    };

    Module.querySelectorsAll = function querySelectorsAll(node, selectors, results) {
      if (node.nodeType === 1) {
        var selectorResults = this.matchSelectors(node, selectors, []);
        results = results.concat(selectorResults);
        var structure = selectorResults.find(function (x) {
          return x.factory.prototype instanceof Structure;
        });

        if (structure) {
          return results;
        }

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

    return Module;
  }();
  function getContext(instance) {
    return CONTEXTS[instance.rxcompId];
  }
  function getContextByNode(node) {
    var context;
    var rxcompId = node['rxcompId'];

    if (rxcompId) {
      var nodeContexts = NODES[rxcompId];

      if (nodeContexts) {
        context = nodeContexts.reduce(function (previous, current) {
          if (current.factory.prototype instanceof Component) {
            return current;
          } else if (current.factory.prototype instanceof Context) {
            return previous ? previous : current;
          } else {
            return previous;
          }
        }, null);
      }
    }

    return context;
  }
  function getHost(instance, factory, node) {
    if (!node) {
      node = getContext(instance).node;
    }

    if (node.rxcompId) {
      var nodeContexts = NODES[node.rxcompId];

      if (nodeContexts) {
        for (var i = 0; i < nodeContexts.length; i++) {
          var context = nodeContexts[i];

          if (context.instance !== instance) {
            if (context.instance instanceof factory) {
              return context.instance;
            }
          }
        }
      }
    }

    if (node.parentNode) {
      return getHost(instance, factory, node.parentNode);
    }
  }

  var ClassDirective = function (_Directive) {
    _inheritsLoose(ClassDirective, _Directive);

    function ClassDirective() {
      var _this;

      _this = _Directive.apply(this, arguments) || this;
      _this.keys = [];
      return _this;
    }

    var _proto = ClassDirective.prototype;

    _proto.onInit = function onInit() {
      var _this2 = this;

      var _getContext = getContext(this),
          node = _getContext.node;

      node.classList.forEach(function (x) {
        return _this2.keys.push(x);
      });
    };

    _proto.onChanges = function onChanges() {
      var _getContext2 = getContext(this),
          node = _getContext2.node;

      var keys;
      var object = this.class;

      if (typeof object === 'object') {
        keys = [];

        for (var key in object) {
          if (object[key]) {
            keys.push(key);
          }
        }
      } else if (typeof object === 'string') {
        keys = object.split(/\s+/);
      }

      keys = (keys || []).concat(this.keys);
      node.setAttribute('class', keys.join(' '));
    };

    return ClassDirective;
  }(Directive);
  ClassDirective.meta = {
    selector: "[[class]]",
    inputs: ['class']
  };

  var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

  var EventDirective = function (_Directive) {
    _inheritsLoose(EventDirective, _Directive);

    function EventDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = EventDirective.prototype;

    _proto.onInit = function onInit() {
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node,
          parentInstance = _getContext.parentInstance,
          selector = _getContext.selector;

      var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
      var event$ = this.event$ = rxjs.fromEvent(node, event).pipe(operators.shareReplay(1));
      var expression = node.getAttribute("(" + event + ")");

      if (expression) {
        var outputFunction = module.makeFunction(expression, ['$event']);
        event$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
          module.resolve(outputFunction, parentInstance, event);
        });
      } else {
        parentInstance[event + "$"] = event$;
      }
    };

    return EventDirective;
  }(Directive);
  EventDirective.meta = {
    selector: "[(" + EVENTS.join(')],[(') + ")]"
  };

  var ForItem = function (_Context) {
    _inheritsLoose(ForItem, _Context);

    function ForItem(key, $key, value, $value, index, count, parentInstance) {
      var _this;

      _this = _Context.call(this, parentInstance) || this;
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

  var ForStructure = function (_Structure) {
    _inheritsLoose(ForStructure, _Structure);

    function ForStructure() {
      var _this;

      _this = _Structure.apply(this, arguments) || this;
      _this.instances = [];
      return _this;
    }

    var _proto = ForStructure.prototype;

    _proto.onInit = function onInit() {
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node;

      var forbegin = this.forbegin = document.createComment("*for begin");
      forbegin['rxcompId'] = node.rxcompId;
      node.parentNode.replaceChild(forbegin, node);
      var forend = this.forend = document.createComment("*for end");
      forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
      var expression = node.getAttribute('*for');
      node.removeAttribute('*for');
      var token = this.token = this.getExpressionToken(expression);
      this.forFunction = module.makeFunction(token.iterable);
    };

    _proto.onChanges = function onChanges(changes) {
      var context = getContext(this);
      var module = context.module;
      var node = context.node;
      var token = this.token;
      var result = module.resolve(this.forFunction, changes, this) || [];
      var isArray = Array.isArray(result);
      var array = isArray ? result : Object.keys(result);
      var total = array.length;
      var previous = this.instances.length;

      for (var i = 0; i < Math.max(previous, total); i++) {
        if (i < total) {
          var key = isArray ? i : array[i];
          var value = isArray ? array[key] : result[key];

          if (i < previous) {
            var instance = this.instances[i];
            instance[token.key] = key;
            instance[token.value] = value;
          } else {
            var clonedNode = node.cloneNode(true);
            delete clonedNode['rxcompId'];
            this.forend.parentNode.insertBefore(clonedNode, this.forend);
            var args = [token.key, key, token.value, value, i, total, context.parentInstance];

            var _instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args);

            if (_instance) {
              var forItemContext = getContext(_instance);
              module.compile(clonedNode, forItemContext.instance);
              this.instances.push(_instance);
            }
          }
        } else {
          var _instance2 = this.instances[i];

          var _getContext2 = getContext(_instance2),
              _node = _getContext2.node;

          _node.parentNode.removeChild(_node);

          module.remove(_node);
        }
      }

      this.instances.length = array.length;
    };

    _proto.getExpressionToken = function getExpressionToken(expression) {
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

  var HrefDirective = function (_Directive) {
    _inheritsLoose(HrefDirective, _Directive);

    function HrefDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = HrefDirective.prototype;

    _proto.onChanges = function onChanges() {
      var _getContext = getContext(this),
          node = _getContext.node;

      node.setAttribute('href', this.href);
    };

    return HrefDirective;
  }(Directive);
  HrefDirective.meta = {
    selector: '[[href]]',
    inputs: ['href']
  };

  var IfStructure = function (_Structure) {
    _inheritsLoose(IfStructure, _Structure);

    function IfStructure() {
      var _this;

      _this = _Structure.apply(this, arguments) || this;
      _this.instances = [];
      return _this;
    }

    var _proto = IfStructure.prototype;

    _proto.onInit = function onInit() {
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node;

      var ifbegin = this.ifbegin = document.createComment("*if begin");
      ifbegin['rxcompId'] = node.rxcompId;
      node.parentNode.replaceChild(ifbegin, node);
      var ifend = this.ifend = document.createComment("*if end");
      ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
      var expression = node.getAttribute('*if');
      this.ifFunction = module.makeFunction(expression);
      var clonedNode = node.cloneNode(true);
      clonedNode.removeAttribute('*if');
      this.clonedNode = clonedNode;
      this.node = clonedNode.cloneNode(true);
    };

    _proto.onChanges = function onChanges(changes) {
      var _getContext2 = getContext(this),
          module = _getContext2.module;

      var value = module.resolve(this.ifFunction, changes, this);
      var node = this.node;

      if (value) {
        if (!node.parentNode) {
          this.ifend.parentNode.insertBefore(node, this.ifend);
          module.compile(node);
        }
      } else {
        if (node.parentNode) {
          module.remove(node, this);
          node.parentNode.removeChild(node);
          this.node = this.clonedNode.cloneNode(true);
        }
      }
    };

    return IfStructure;
  }(Structure);
  IfStructure.meta = {
    selector: '[*if]'
  };

  var InnerHtmlDirective = function (_Directive) {
    _inheritsLoose(InnerHtmlDirective, _Directive);

    function InnerHtmlDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = InnerHtmlDirective.prototype;

    _proto.onChanges = function onChanges() {
      var _getContext = getContext(this),
          node = _getContext.node;

      node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML;
    };

    return InnerHtmlDirective;
  }(Directive);
  InnerHtmlDirective.meta = {
    selector: "[innerHTML]",
    inputs: ['innerHTML']
  };

  var Pipe = function () {
    function Pipe() {}

    Pipe.transform = function transform(value) {
      return value;
    };

    return Pipe;
  }();

  var JsonPipe = function (_Pipe) {
    _inheritsLoose(JsonPipe, _Pipe);

    function JsonPipe() {
      return _Pipe.apply(this, arguments) || this;
    }

    JsonPipe.transform = function transform(value) {
      return JSON.stringify(value, null, '\t');
    };

    return JsonPipe;
  }(Pipe);
  JsonPipe.meta = {
    name: 'json'
  };

  var SrcDirective = function (_Directive) {
    _inheritsLoose(SrcDirective, _Directive);

    function SrcDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = SrcDirective.prototype;

    _proto.onChanges = function onChanges() {
      var _getContext = getContext(this),
          node = _getContext.node;

      if (this.src) {
        node.setAttribute('src', this.src);
      } else {
        node.removeAttribute('src');
      }
    };

    return SrcDirective;
  }(Directive);
  SrcDirective.meta = {
    selector: '[[src]]',
    inputs: ['src']
  };

  var StyleDirective = function (_Directive) {
    _inheritsLoose(StyleDirective, _Directive);

    function StyleDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = StyleDirective.prototype;

    _proto.onChanges = function onChanges() {
      var _getContext = getContext(this),
          node = _getContext.node;

      var style = this.style;
      var previousStyle = this.previousStyle;

      if (previousStyle) {
        for (var key in previousStyle) {
          if (!style || !style[key]) {
            var splitted = key.split('.');
            var propertyName = splitted.shift();
            node.style.removeProperty(propertyName);
          }
        }
      }

      if (style) {
        for (var _key in style) {
          if (!previousStyle || previousStyle[_key] !== style[_key]) {
            var _splitted = _key.split('.');

            var _propertyName = _splitted.shift();

            var value = style[_key] + (_splitted.length ? _splitted[0] : '');
            node.style.setProperty(_propertyName, value);
          }
        }
      }

      this.previousStyle = style;
    };

    return StyleDirective;
  }(Directive);
  StyleDirective.meta = {
    selector: "[[style]]",
    inputs: ['style']
  };

  var CoreModule = function (_Module) {
    _inheritsLoose(CoreModule, _Module);

    function CoreModule() {
      return _Module.apply(this, arguments) || this;
    }

    return CoreModule;
  }(Module);
  var factories = [ClassDirective, EventDirective, ForStructure, HrefDirective, IfStructure, InnerHtmlDirective, SrcDirective, StyleDirective];
  var pipes = [JsonPipe];
  CoreModule.meta = {
    declarations: [].concat(factories, pipes),
    exports: [].concat(factories, pipes)
  };

  var ORDER = [Structure, Component, Directive];

  var Platform = function () {
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
      var root = instances[0];
      root.pushChanges();
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

      var importedPipes = meta.imports.map(function (importMeta) {
        return _this2.resolvePipes(importMeta, true);
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

      var importedFactories = meta.imports.map(function (importMeta) {
        return _this3.resolveFactories(importMeta, true);
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
        }, -1);
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
            return node.hasAttribute(a2) && node.getAttribute(a2) === v4 || node.hasAttribute("[" + a2 + "]") && node.getAttribute("[" + a2 + "]") === v4;
          });
        }

        if (a5) {
          matchers.push(function (node) {
            return node.hasAttribute(a5) || node.hasAttribute("[" + a5 + "]");
          });
        }

        if (e6) {
          matchers.push(function (node) {
            return node.nodeName.toLowerCase() === e6.toLowerCase();
          });
        }

        return '';
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
            var included = includes.reduce(function (p, match) {
              return p && match(node);
            }, true);
            var excluded = excludes.reduce(function (p, match) {
              return p || match(node);
            }, false);

            if (included && !excluded) {
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
      return Boolean(window);
    };

    return Platform;
  }();

  var Browser = function (_Platform) {
    _inheritsLoose(Browser, _Platform);

    function Browser() {
      return _Platform.apply(this, arguments) || this;
    }

    return Browser;
  }(Platform);

  var LocalStorageService = function () {
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

  var StoreService = function () {
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
          id: 5,
          name: 'Cookies',
          date: new Date(Date.now())
        }, {
          id: 4,
          name: 'Pizza',
          date: new Date(2019, 4, 4, 12)
        }, {
          id: 3,
          name: 'Pasta',
          date: new Date(2019, 3, 22, 12)
        }, {
          id: 2,
          name: 'Bread',
          date: new Date(2019, 0, 6, 12)
        }, {
          id: 1,
          name: 'Ham',
          date: new Date(2018, 11, 30, 12)
        }];
        LocalStorageService.set('items', items);
      }

      this.store$ = new rxjs.BehaviorSubject(items);
      return this.store$.pipe(operators.delay(1));
    };

    StoreService.add$ = function add$(patch) {
      var item = Object.assign({
        id: Date.now(),
        date: new Date(Date.now())
      }, patch);
      var items = this.store$.getValue();
      items.unshift(item);
      this.set(items);
      return rxjs.of(item).pipe(operators.delay(1));
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

      return rxjs.of(item).pipe(operators.delay(1));
    };

    StoreService.delete$ = function delete$(item) {
      var items = this.store$.getValue();
      var index = items.indexOf(item);

      if (index !== -1) {
        items.splice(index, 1);
        this.set(items);
      }

      return rxjs.of(item).pipe(operators.delay(1));
    };

    return StoreService;
  }();

  var AppComponent = function (_Component) {
    _inheritsLoose(AppComponent, _Component);

    function AppComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = AppComponent.prototype;

    _proto.onInit = function onInit() {
      var _this = this;

      var context = getContext(this);
      this.input = context.node.querySelector('.control--text');
      this.items = [];
      this.store$ = StoreService.get$();
      this.store$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
        _this.items = items;

        _this.pushChanges();
      });
    };

    _proto.onInput = function onInput($event) {
      this.pushChanges();
    };

    _proto.onAddItem = function onAddItem($event) {
      var _this2 = this;

      if (this.input.value) {
        StoreService.add$({
          name: this.input.value
        }).subscribe(function (item) {
          _this2.input.value = null;
        });
      }
    };

    _proto.onToggleItem = function onToggleItem(item) {
      StoreService.patch$({
        id: item.id,
        done: !item.done
      }).subscribe(function (item) {});
    };

    _proto.onRemoveItem = function onRemoveItem(item) {
      StoreService.delete$(item).subscribe(function (item) {});
    };

    return AppComponent;
  }(Component);
  AppComponent.meta = {
    selector: '[app-component]'
  };

  var DatePipe = function (_Pipe) {
    _inheritsLoose(DatePipe, _Pipe);

    function DatePipe() {
      return _Pipe.apply(this, arguments) || this;
    }

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

      var localeDateString = new Date(value).toLocaleDateString(locale, options);
      return localeDateString;
    };

    return DatePipe;
  }(Pipe);
  DatePipe.meta = {
    name: 'date'
  };

  var colors = [{
    hex: '#ffffff',
    background: '#ffffff',
    foreground: '#003adc',
    accent: '#212121'
  }, {
    hex: '#212121',
    background: '#212121',
    foreground: '#ffffff',
    accent: '#003adc'
  }, {
    hex: '#ffffff',
    background: '#ffffff',
    foreground: '#212121',
    accent: '#003adc'
  }, {
    hex: '#003adc',
    background: '#003adc',
    foreground: '#ffffff',
    accent: '#212121'
  }];
  function background(index, alpha) {
    return hexToRgb(colors[index % colors.length].background, alpha);
  }
  function foreground(index, alpha) {
    return hexToRgb(colors[index % colors.length].foreground, alpha);
  }
  function accent(index, alpha) {
    return hexToRgb(colors[index % colors.length].accent, alpha);
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

  var TodoItemComponent = function (_Component) {
    _inheritsLoose(TodoItemComponent, _Component);

    function TodoItemComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = TodoItemComponent.prototype;

    _proto.onChanges = function onChanges(changes) {
      this.background = background(this.item.id);
      this.foreground = foreground(this.item.id);
      this.accent = accent(this.item.id);
    };

    _proto.onToggle = function onToggle($event) {
      this.toggle.next($event);
    };

    _proto.onRemove = function onRemove($event) {
      this.remove.next($event);
    };

    return TodoItemComponent;
  }(Component);
  TodoItemComponent.meta = {
    selector: '[todo-item-component]',
    inputs: ['item'],
    outputs: ['toggle', 'remove']
  };

  var AppModule = function (_Module) {
    _inheritsLoose(AppModule, _Module);

    function AppModule() {
      return _Module.apply(this, arguments) || this;
    }

    return AppModule;
  }(Module);
  AppModule.meta = {
    imports: [CoreModule],
    declarations: [TodoItemComponent, DatePipe],
    bootstrap: AppComponent
  };

  Browser.bootstrap(AppModule);

}(rxjs, rxjs.operators));
