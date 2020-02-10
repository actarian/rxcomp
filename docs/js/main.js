/**
 * @license rxcomp v1.0.0-beta.5
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

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

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var Directive = /** @class */ (function () {
      function Directive() {
      }
      return Directive;
  }());

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function __spreadArrays() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
      return r;
  }

  var Component = /** @class */ (function () {
      function Component() {
      }
      return Component;
  }());

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

  var Structure = function Structure() {};

  var ID = 0;
  var CONTEXTS = {};
  var NODES = {};
  var Module = /** @class */ (function () {
      function Module() {
      }
      Module.prototype.compile = function (node, parentInstance) {
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
          }).filter(function (x) { return x; });
          // console.log('compile', instances, node, parentInstance);
          return instances;
      };
      Module.prototype.makeInstance = function (node, factory, selector, parentInstance, args) {
          var _this = this;
          if (parentInstance || node.parentNode) {
              var isComponent_1 = factory.prototype instanceof Component;
              var meta_1 = factory.meta;
              // console.log('meta', meta, factory);
              // collect parentInstance scope
              parentInstance = parentInstance || this.getParentInstance(node.parentNode);
              if (!parentInstance) {
                  return;
              }
              // creating factory instance
              var instance_1 = new (factory.bind.apply(factory, __spreadArrays([void 0], (args || []))))();
              // creating instance context
              var context = Module.makeContext(this, instance_1, parentInstance, node, factory, selector);
              // injecting changes$ and unsubscribe$ subjects
              Object.defineProperties(instance_1, {
                  changes$: {
                      value: new rxjs.BehaviorSubject(instance_1),
                      writable: false,
                      enumerable: false,
                  },
                  unsubscribe$: {
                      value: new rxjs.Subject(),
                      writable: false,
                      enumerable: false,
                  }
              });
              var initialized_1;
              // injecting instance pushChanges method
              var module_1 = this;
              instance_1.pushChanges = function () {
                  // console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
                  this.changes$.next(this);
                  // parse component text nodes
                  if (isComponent_1) {
                      // console.log('Module.parse', instance.constructor.name);
                      initialized_1 ? module_1.parse(node, instance_1) : setTimeout(function () { module_1.parse(node, instance_1); });
                  }
                  // calling onView event
                  if (typeof instance_1.onView === 'function') {
                      // console.log('onView', instance.constructor.name);
                      instance_1.onView();
                  }
              };
              // creating component input and outputs
              // if (isComponent && meta) {
              if (meta_1) {
                  this.makeHosts(meta_1, instance_1, node);
                  context.inputs = this.makeInputs(meta_1, instance_1);
                  context.outputs = this.makeOutputs(meta_1, instance_1);
              }
              // calling onInit event
              if (typeof instance_1.onInit === 'function') {
                  instance_1.onInit();
              }
              initialized_1 = true;
              // subscribe to parent changes
              if (parentInstance.changes$) {
                  parentInstance.changes$.pipe(
                  // filter(() => node.parentNode),
                  // debounceTime(1),
                  /*
                  distinctUntilChanged(function(prev, curr) {
                      console.log(isComponent, context.inputs);
                      if (isComponent && meta && Object.keys(context.inputs).length === 0) {
                          return true; // same
                      } else {
                          return false;
                      }
                  }),
                  */
                  operators.takeUntil(instance_1.unsubscribe$)).subscribe(function (changes) {
                      // resolve component input outputs
                      // if (isComponent && meta) {
                      if (meta_1) {
                          _this.resolveInputsOutputs(instance_1, changes);
                      }
                      // calling onChanges event with parentInstance
                      if (typeof instance_1.onChanges === 'function') {
                          // console.log('onChanges', instance.constructor.name);
                          // console.log('onChanges', instance.constructor.meta.selector, changes);
                          instance_1.onChanges(changes);
                      }
                      // push instance changes for subscribers
                      instance_1.pushChanges();
                  });
              }
              return instance_1;
          }
      };
      Module.prototype.makeContext = function (instance, parentInstance, node, selector) {
          var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector);
          // console.log('Module.makeContext', context, context.instance, context.node);
          return context;
      };
      Module.prototype.makeFunction = function (expression, params) {
          if (params === void 0) { params = ['$instance']; }
          if (expression) {
              expression = Module.parseExpression(expression);
              // console.log(expression);
              var args = params.join(',');
              var expression_func = new Function("with(this) {\n\t\t\t\treturn (function (" + args + ", $$module) {\n\t\t\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\t\t\treturn " + expression + ";\n\t\t\t\t}.bind(this)).apply(this, arguments);\n\t\t\t}");
              // console.log(expression_func);
              return expression_func;
          }
          else {
              return function () { return null; };
          }
      };
      Module.prototype.getInstance = function (node) {
          if (node === document) {
              return window;
          }
          var context = getContextByNode(node);
          if (context) {
              return context.instance;
          }
      };
      Module.prototype.getParentInstance = function (node) {
          var _this = this;
          return Module.traverseUp(node, function (node) {
              return _this.getInstance(node);
          });
      };
      Module.prototype.parse = function (node, instance) {
          for (var i = 0; i < node.childNodes.length; i++) {
              var child = node.childNodes[i];
              if (child.nodeType === 1) {
                  var context = getContextByNode(child);
                  if (!context) {
                      this.parse(child, instance);
                  }
              }
              else if (child.nodeType === 3) {
                  this.parseTextNode(child, instance);
              }
          }
      };
      Module.prototype.parseTextNode = function (node, instance) {
          var _this = this;
          var expressions = node.nodeExpressions;
          if (!expressions) {
              expressions = this.parseTextNodeExpression(node.nodeValue);
          }
          var replacedText = expressions.reduce(function (p, c) {
              var text;
              if (typeof c === 'function') {
                  text = _this.resolve(c, instance, instance);
                  if (text == undefined) { // !!! keep == loose equality
                      text = '';
                  }
              }
              else {
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
      Module.prototype.parseTextNodeExpression = function (expression) {
          var expressions = [];
          var regex = /\{{2}((([^{}])|(\{([^{}]|(\{.*?\}))+?\}))*?)\}{2}/g;
          var lastIndex = 0, matches;
          var pushFragment = function (from, to) {
              var fragment = expression.substring(from, to);
              expressions.push(fragment);
          };
          while ((matches = regex.exec(expression)) !== null) {
              var index = regex.lastIndex - matches[0].length;
              if (index > lastIndex) {
                  pushFragment(index, lastIndex);
              }
              lastIndex = regex.lastIndex;
              var fragment = this.makeFunction(matches[1]);
              expressions.push(fragment);
          }
          var length = expression.length;
          if (length > lastIndex) {
              pushFragment(lastIndex, length);
          }
          return expressions;
      };
      Module.prototype.resolve = function (expressionFunc, changes, payload) {
          // console.log(expressionFunc, changes, payload);
          return expressionFunc.apply(changes, [payload, this]);
      };
      Module.prototype.makeHosts = function (meta, instance, node) {
          if (meta.hosts) {
              Object.keys(meta.hosts).forEach(function (key) {
                  var factory = meta.hosts[key];
                  instance[key] = getHost(instance, factory, node);
              });
          }
      };
      Module.prototype.makeInput = function (instance, key) {
          var node = getContext(instance).node;
          var input, expression = null;
          if (node.hasAttribute(key)) {
              // const attribute = node.getAttribute(key).replace(/{{/g, '"+').replace(/}}/g, '+"');
              var attribute = node.getAttribute(key).replace(/({{)|(}})|(")/g, function (match, a, b, c) {
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
          else if (node.hasAttribute("[" + key + "]")) {
              expression = node.getAttribute("[" + key + "]");
          }
          if (expression !== null) {
              input = this.makeFunction(expression);
          }
          return input;
      };
      Module.prototype.makeInputs = function (meta, instance) {
          var _this = this;
          var inputs = {};
          if (meta.inputs) {
              meta.inputs.forEach(function (key, i) {
                  var input = _this.makeInput(instance, key);
                  if (input) {
                      inputs[key] = input;
                  }
              });
          }
          return inputs;
      };
      Module.prototype.makeOutput = function (instance, key) {
          var _this = this;
          var context = getContext(instance);
          var node = context.node;
          var parentInstance = context.parentInstance;
          var expression = node.getAttribute("(" + key + ")");
          var outputFunction = this.makeFunction(expression, ['$event']);
          var output$ = new rxjs.Subject().pipe(operators.tap(function (event) {
              _this.resolve(outputFunction, parentInstance, event);
          }));
          output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
          instance[key] = output$;
          return outputFunction;
      };
      Module.prototype.makeOutputs = function (meta, instance) {
          var _this = this;
          var outputs = {};
          if (meta.outputs) {
              meta.outputs.forEach(function (key, i) { return outputs[key] = _this.makeOutput(instance, key); });
          }
          return outputs;
      };
      Module.prototype.resolveInputsOutputs = function (instance, changes) {
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
      Module.prototype.destroy = function () {
          this.remove(this.meta.node);
          this.meta.node.innerHTML = this.meta.nodeInnerHTML;
      };
      Module.prototype.remove = function (node, keepInstance) {
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
      Module.parseExpression = function (expression) {
          var l = '┌';
          var r = '┘';
          var rx1 = /(\()([^\(\)]*)(\))/;
          while (expression.match(rx1)) {
              expression = expression.replace(rx1, function () {
                  var g1 = [];
                  for (var _i = 0; _i < arguments.length; _i++) {
                      g1[_i] = arguments[_i];
                  }
                  return "" + l + Module.parsePipes(g1[2]) + r;
              });
          }
          expression = Module.parsePipes(expression);
          expression = expression.replace(/(┌)|(┘)/g, function () {
              var g2 = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  g2[_i] = arguments[_i];
              }
              return g2[1] ? '(' : ')';
          });
          return Module.parseOptionalChaining(expression);
      };
      Module.parsePipes = function (expression) {
          var rx1 = /(.*?[^\|])\|([^\|]+)/;
          while (expression.match(rx1)) {
              expression = expression.replace(rx1, function () {
                  var g1 = [];
                  for (var _i = 0; _i < arguments.length; _i++) {
                      g1[_i] = arguments[_i];
                  }
                  var value = g1[1].trim();
                  var params = Module.parsePipeParams(g1[2]);
                  var func = params.shift().trim();
                  return "$$pipes." + func + ".transform\u250C" + __spreadArrays([value], params) + "\u2518";
              });
          }
          return expression;
      };
      Module.parsePipeParams = function (expression) {
          var segments = [];
          var i = 0, word = '', block = 0;
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
              }
              else {
                  word += c;
              }
              i++;
          }
          if (word.length) {
              segments.push(word.trim());
          }
          return segments;
      };
      Module.parseOptionalChaining = function (expression) {
          var regex = /(\w+(\?\.))+([\.|\w]+)/g;
          var previous;
          expression = expression.replace(regex, function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              var tokens = args[0].split('?.');
              for (var i = 0; i < tokens.length - 1; i++) {
                  var a = i > 0 ? "(" + tokens[i] + " = " + previous + ")" : tokens[i];
                  var b = tokens[i + 1];
                  previous = i > 0 ? a + "." + b : "(" + a + " ? " + a + "." + b + " : void 0)";
              }
              return previous || '';
          });
          return expression;
      };
      Module.makeContext = function (module, instance, parentInstance, node, factory, selector) {
          instance.rxcompId = ++ID;
          var context = { module: module, instance: instance, parentInstance: parentInstance, node: node, factory: factory, selector: selector };
          var rxcompNodeId = node.rxcompId = (node.rxcompId || instance.rxcompId);
          var nodeContexts = NODES[rxcompNodeId] || (NODES[rxcompNodeId] = []);
          nodeContexts.push(context);
          return CONTEXTS[instance.rxcompId] = context;
      };
      Module.deleteContext = function (id, keepContext) {
          var keepContexts = [];
          var nodeContexts = NODES[id];
          if (nodeContexts) {
              nodeContexts.forEach(function (context) {
                  if (context === keepContext) {
                      keepContexts.push(keepContext);
                  }
                  else {
                      var instance = context.instance;
                      instance.unsubscribe$.next();
                      instance.unsubscribe$.complete();
                      if (typeof instance.onDestroy === 'function') {
                          instance.onDestroy();
                          delete CONTEXTS[instance.rxcompId];
                      }
                  }
              });
              if (keepContexts.length) {
                  NODES[id] = keepContexts;
              }
              else {
                  delete NODES[id];
              }
          }
          return keepContexts;
      };
      Module.matchSelectors = function (node, selectors, results) {
          for (var i = 0; i < selectors.length; i++) {
              var match = selectors[i](node);
              if (match) {
                  var factory = match.factory;
                  if (factory.prototype instanceof Component && factory.meta.template) {
                      node.innerHTML = factory.meta.template;
                  }
                  results.push(match);
                  if (factory.prototype instanceof Structure) {
                      // console.log('Structure', node);
                      break;
                  }
              }
          }
          return results;
      };
      Module.querySelectorsAll = function (node, selectors, results) {
          if (node.nodeType === 1) {
              var matches = this.matchSelectors(node, selectors, []);
              results = results.concat(matches);
              var structure = matches.find(function (x) { return x.factory.prototype instanceof Structure; });
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
      Module.traverseUp = function (node, callback, i) {
          if (i === void 0) { i = 0; }
          if (!node) {
              return;
          }
          var result = callback(node, i);
          if (result) {
              return result;
          }
          return this.traverseUp(node.parentNode, callback, i + 1);
      };
      Module.traverseDown = function (node, callback, i) {
          if (i === void 0) { i = 0; }
          if (!node) {
              return;
          }
          var result = callback(node, i);
          if (result) {
              return result;
          }
          if (node.nodeType === 1) {
              var j = 0, t = node.childNodes.length;
              while (j < t && !result) {
                  result = this.traverseDown(node.childNodes[j], callback, i + 1);
                  j++;
              }
          }
          return result;
      };
      Module.traversePrevious = function (node, callback, i) {
          if (i === void 0) { i = 0; }
          if (!node) {
              return;
          }
          var result = callback(node, i);
          if (result) {
              return result;
          }
          return this.traversePrevious(node.previousSibling, callback, i + 1);
      };
      Module.traverseNext = function (node, callback, i) {
          if (i === void 0) { i = 0; }
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
  }());
  function getContext(instance) {
      return CONTEXTS[instance.rxcompId];
  }
  function getContextByNode(node) {
      var context;
      var nodeContexts = NODES[node.rxcompId];
      if (nodeContexts) {
          context = nodeContexts.reduce(function (previous, current) {
              if (current.factory.prototype instanceof Component) {
                  return current;
              }
              else if (current.factory.prototype instanceof Context) {
                  return previous ? previous : current;
              }
              else {
                  return previous;
              }
          }, null);
          // console.log(node.rxcompId, context);
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
              // console.log(nodeContexts);
              for (var i = 0; i < nodeContexts.length; i++) {
                  var context = nodeContexts[i];
                  if (context.instance !== instance) {
                      // console.log(context.instance, instance);
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

  var ClassDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(ClassDirective, _Directive);

    function ClassDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = ClassDirective.prototype;

    _proto.onInit = function onInit() {
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node;

      var expression = node.getAttribute('[class]');
      this.classFunction = module.makeFunction(expression); // console.log('ClassDirective.onInit', this.classList, expression);
    };

    _proto.onChanges = function onChanges(changes) {
      var _getContext2 = getContext(this),
          module = _getContext2.module,
          node = _getContext2.node;

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

  var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

  var EventDirective =
  /*#__PURE__*/
  function (_Directive) {
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
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node;

      var forbegin = this.forbegin = document.createComment("*for begin");
      forbegin.rxcompId = node.rxcompId;
      node.parentNode.replaceChild(forbegin, node);
      var forend = this.forend = document.createComment("*for end");
      forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
      var expression = node.getAttribute('*for'); // this.expression = expression;

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
            delete clonedNode.rxcompId;
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

          var _getContext2 = getContext(_instance2),
              _node = _getContext2.node;

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

  var HrefDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(HrefDirective, _Directive);

    function HrefDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = HrefDirective.prototype;

    _proto.onChanges = function onChanges(changes) {
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

  var IfStructure =
  /*#__PURE__*/
  function (_Structure) {
    _inheritsLoose(IfStructure, _Structure);

    function IfStructure() {
      return _Structure.apply(this, arguments) || this;
    }

    var _proto = IfStructure.prototype;

    _proto.onInit = function onInit() {
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node;

      var ifbegin = this.ifbegin = document.createComment("*if begin");
      ifbegin.rxcompId = node.rxcompId;
      node.parentNode.replaceChild(ifbegin, node);
      var ifend = this.ifend = document.createComment("*if end");
      ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
      var expression = node.getAttribute('*if');
      this.ifFunction = module.makeFunction(expression);
      var clonedNode = node.cloneNode(true);
      clonedNode.removeAttribute('*if');
      this.clonedNode = clonedNode;
      this.node = clonedNode.cloneNode(true); // console.log('IfStructure.expression', expression);
    };

    _proto.onChanges = function onChanges(changes) {
      var _getContext2 = getContext(this),
          module = _getContext2.module; // console.log('IfStructure.onChanges', changes);


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

  var InnerHtmlDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(InnerHtmlDirective, _Directive);

    function InnerHtmlDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = InnerHtmlDirective.prototype;

    _proto.onChanges = function onChanges(changes) {
      var _getContext = getContext(this),
          node = _getContext.node;

      node.innerHTML = this.innerHTML == undefined ? '' : this.innerHTML; // !!! keep == loose equality
    };

    return InnerHtmlDirective;
  }(Directive);
  InnerHtmlDirective.meta = {
    selector: "[innerHTML]",
    inputs: ['innerHTML']
  };

  var Pipe = /** @class */ (function () {
      function Pipe() {
      }
      Pipe.transform = function (value) {
          return value;
      };
      return Pipe;
  }());

  var JsonPipe =
  /*#__PURE__*/
  function (_Pipe) {
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

  var SrcDirective =
  /*#__PURE__*/
  function (_Directive) {
    _inheritsLoose(SrcDirective, _Directive);

    function SrcDirective() {
      return _Directive.apply(this, arguments) || this;
    }

    var _proto = SrcDirective.prototype;

    _proto.onChanges = function onChanges(changes) {
      var _getContext = getContext(this),
          node = _getContext.node;

      node.setAttribute('src', this.src);
    };

    return SrcDirective;
  }(Directive);
  SrcDirective.meta = {
    selector: '[[src]]',
    inputs: ['src']
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
      var _getContext = getContext(this),
          module = _getContext.module,
          node = _getContext.node;

      var expression = node.getAttribute('[style]');
      this.styleFunction = module.makeFunction(expression); // console.log('StyleDirective.onInit', expression);
    };

    _proto.onChanges = function onChanges(changes) {
      var _getContext2 = getContext(this),
          module = _getContext2.module,
          node = _getContext2.node;

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
  var factories = [ClassDirective, EventDirective, ForStructure, HrefDirective, IfStructure, InnerHtmlDirective, SrcDirective, StyleDirective];
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

  var StoreService = /** @class */ (function () {
      function StoreService() {
      }
      StoreService.set = function (items) {
          LocalStorageService.set('items', items);
          return this.get$().next(items);
      };
      StoreService.get$ = function () {
          if (this.store$) {
              return this.store$;
          }
          var items = LocalStorageService.get('items');
          if (!items) {
              items = [
                  { id: 5, name: 'Cookies', date: new Date(Date.now()) },
                  { id: 4, name: 'Pizza', date: new Date(2019, 4, 4, 12) },
                  { id: 3, name: 'Pasta', date: new Date(2019, 3, 22, 12) },
                  { id: 2, name: 'Bread', date: new Date(2019, 0, 6, 12) },
                  { id: 1, name: 'Ham', date: new Date(2018, 11, 30, 12) },
              ];
              LocalStorageService.set('items', items);
          }
          this.store$ = new rxjs.BehaviorSubject(items);
          return this.store$.pipe(operators.delay(1) // simulate http
          );
      };
      StoreService.add$ = function (patch) {
          var item = Object.assign({
              id: Date.now(),
              date: new Date(Date.now())
          }, patch);
          var items = this.store$.getValue();
          items.unshift(item);
          this.set(items);
          return rxjs.of(item).pipe(operators.delay(1) // simulate http
          );
      };
      StoreService.patch$ = function (patch) {
          var items = this.store$.getValue();
          var item = items.find(function (x) { return x.id === patch.id; });
          if (item) {
              Object.assign(item, patch);
              this.set(items);
          }
          return rxjs.of(item).pipe(operators.delay(1) // simulate http
          );
      };
      StoreService.delete$ = function (item) {
          var items = this.store$.getValue();
          var index = items.indexOf(item);
          if (index !== -1) {
              items.splice(index, 1);
              this.set(items);
          }
          return rxjs.of(item).pipe(operators.delay(1) // simulate http
          );
      };
      return StoreService;
  }());

  var AppComponent = /** @class */ (function (_super) {
      __extends(AppComponent, _super);
      function AppComponent() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      AppComponent.prototype.onInit = function () {
          var _this = this;
          // context
          var context = getContext(this);
          // input
          this.input = context.node.querySelector('.control--text');
          // items
          this.items = [];
          // store service
          this.store$ = StoreService.get$();
          this.store$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (items) {
              _this.items = items;
              // onpush change detection strategy
              _this.pushChanges();
          });
      };
      AppComponent.prototype.onInput = function ($event) {
          // console.log('AppComponent.onInput', $event, this);
          this.pushChanges();
      };
      AppComponent.prototype.onAddItem = function ($event) {
          var _this = this;
          if (this.input.value) {
              StoreService.add$({
                  name: this.input.value,
              }).subscribe(function (item) {
                  // console.log('AppComponent.onAddItem', item);
                  _this.input.value = null;
              });
          }
      };
      AppComponent.prototype.onToggleItem = function (item) {
          StoreService.patch$({
              id: item.id,
              done: !item.done,
          }).subscribe(function (item) {
              // console.log('AppComponent.onToggleItem', item);
          });
      };
      AppComponent.prototype.onRemoveItem = function (item) {
          StoreService.delete$(item).subscribe(function (item) {
              // console.log('AppComponent.onRemoveItem', item);
          });
      };
      return AppComponent;
  }(Component));
  AppComponent.meta = {
      selector: '[app-component]',
  };

  var DatePipe =
  /*#__PURE__*/
  function (_Pipe) {
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

  var TodoItemComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(TodoItemComponent, _Component);

    function TodoItemComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = TodoItemComponent.prototype;

    // onInit() {}
    _proto.onChanges = function onChanges(changes) {
      // console.log('onChanges', changes);
      this.background = background(this.item.id);
      this.foreground = foreground(this.item.id);
      this.accent = accent(this.item.id);
    } // onView() {}
    // onDestroy() {}
    ;

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
    outputs: ['toggle', 'remove'] // template syntax example

    /*
    template: // html // `
    	<div class="content" [style]="{ background: background, color: foreground, '--accent': accent }">
    		<button type="button" class="btn--toggle" (click)="onToggle(item)">
    			<i class="icon--check" *if="item.done"></i>
    			<i class="icon--circle" *if="!item.done"></i>
    			<div class="title" [innerHTML]="item.name"></div>
    		</button>
    		<div class="date" [style]="{ background: backgroundColor, color: color }" [innerHTML]="item.date | date : 'en-US' : { month: 'short', day: '2-digit', year: 'numeric' }"></div>
    		<button type="button" class="btn--remove" (click)="onRemove(item)"><i class="icon--remove"></i></button>
    	</div>
    `,
    */

  };

  var AppModule = /** @class */ (function (_super) {
      __extends(AppModule, _super);
      function AppModule() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      return AppModule;
  }(Module));
  AppModule.meta = {
      imports: [
          CoreModule
      ],
      declarations: [
          TodoItemComponent,
          DatePipe,
      ],
      bootstrap: AppComponent,
  };

  Browser.bootstrap(AppModule);

})));
