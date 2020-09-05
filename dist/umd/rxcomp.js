/**
 * @license rxcomp v1.0.0-beta.17
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports,require('rxjs'),require('rxjs/operators')):typeof define==='function'&&define.amd?define(['exports','rxjs','rxjs/operators'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.rxcomp={},g.rxjs,g.rxjs.operators));}(this,(function(exports, rxjs, operators){'use strict';function _defineProperties(target, props) {
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

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
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
  if (_isNativeReflectConstruct()) {
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

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}var CONTEXTS = {};
var NODES = {};

var Factory = /*#__PURE__*/function () {
  function Factory() {
    this.rxcompId = -1;
    this.unsubscribe$ = new rxjs.Subject();
    this.changes$ = new rxjs.ReplaySubject(1);
    /*
    // !!! PROXY
    const store: { [key: string]: any } = {};
    const handler: ProxyHandler<Factory> = {
        get: function (target: Factory, prop: string, receiver: any) {
            return target[prop];
        },
        set: function (target: Factory, prop: string | number | Symbol, value: any, receiver: any) {
            store[prop as string] = value;
            console.log('Factory updating store', prop, value, store);
            target[prop as string] = value;
            return true;
        }
    }
    const proxy = new Proxy(this, handler);
    console.log('proxy', proxy);
    */
  }

  var _proto = Factory.prototype;

  _proto.onInit = function onInit() {};

  _proto.onChanges = function onChanges(changes) {};

  _proto.onView = function onView() {};

  _proto.onDestroy = function onDestroy() {};

  _proto.pushChanges = function pushChanges() {
    var _getContext = getContext(this),
        module = _getContext.module;

    if (module.instances) {
      this.changes$.next(this);
      this.onView();
    }
  };

  _proto.onParentDidChange = function onParentDidChange(changes) {
    var _getContext2 = getContext(this),
        module = _getContext2.module; // console.log('Component.onParentDidChange', changes);


    module.resolveInputsOutputs(this, changes);
    this.onChanges(changes);
    this.pushChanges();
  };

  Factory.getInputsTokens = function getInputsTokens(instance) {
    return this.meta.inputs || [];
  };

  return Factory;
}();
function getContext(instance) {
  return CONTEXTS[instance.rxcompId];
}var Directive = /*#__PURE__*/function (_Factory) {
  _inheritsLoose(Directive, _Factory);

  function Directive() {
    return _Factory.apply(this, arguments) || this;
  }

  return Directive;
}(Factory);var ClassDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(ClassDirective, _Directive);

  function ClassDirective() {
    var _this;

    _this = _Directive.apply(this, arguments) || this;
    _this.class = '';
    _this.keys = [];
    return _this;
  }

  var _proto = ClassDirective.prototype;

  _proto.onInit = function onInit() {
    var _this2 = this;

    var _getContext = getContext(this),
        node = _getContext.node;

    node.classList.forEach(function (value) {
      _this2.keys.push(value);
    });
  };

  _proto.onChanges = function onChanges() {
    var _getContext2 = getContext(this),
        node = _getContext2.node;

    var keys = [];
    var object = this.class;

    if (typeof object === 'object') {
      for (var key in object) {
        if (object[key]) {
          keys.push(key);
        }
      }
    } else if (typeof object === 'string') {
      keys = object.split(/\s+/);
    }

    keys = keys.concat(this.keys); // console.log(keys);

    node.setAttribute('class', keys.join(' ')); // console.log('ClassDirective.onChanges', keys);
  };

  return ClassDirective;
}(Directive);
ClassDirective.meta = {
  selector: "[[class]]",
  inputs: ['class']
};var ModuleError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(ModuleError, _Error);

  function ModuleError() {
    return _Error.apply(this, arguments) || this;
  }

  return ModuleError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var ExpressionError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(ExpressionError, _Error2);

  function ExpressionError(error, module, instance, expression, params) {
    var _this;

    var message = "ExpressionError in " + instance.constructor.name + " \"" + expression + "\"\n\t\t" + error.message;
    _this = _Error2.call(this, message) || this;
    _this.name = error.name; // this.stack = error.stack;

    _this.module = module;
    _this.instance = instance;
    _this.expression = expression;
    _this.params = params;

    var _getContext = getContext(instance),
        node = _getContext.node;

    _this.template = node.outerHTML;
    return _this;
  }

  return ExpressionError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var ErrorInterceptorHandler = /*#__PURE__*/function () {
  function ErrorInterceptorHandler(next, interceptor) {
    this.next = next;
    this.interceptor = interceptor;
  }

  var _proto = ErrorInterceptorHandler.prototype;

  _proto.handle = function handle(error) {
    return this.interceptor.intercept(error, this.next);
  };

  return ErrorInterceptorHandler;
}();
var DefaultErrorHandler = /*#__PURE__*/function () {
  function DefaultErrorHandler() {}

  var _proto2 = DefaultErrorHandler.prototype;

  _proto2.handle = function handle(error) {
    return rxjs.of(error);
  };

  return DefaultErrorHandler;
}();
var ErrorInterceptors = [];
var nextError$ = new rxjs.ReplaySubject(1);
var errors$ = nextError$.pipe(operators.switchMap(function (error) {
  var chain = ErrorInterceptors.reduceRight(function (next, interceptor) {
    return new ErrorInterceptorHandler(next, interceptor);
  }, new DefaultErrorHandler());
  return chain.handle(error);
}), operators.tap(function (error) {
  if (error) {
    console.error(error);
  }
}));var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

var EventDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(EventDirective, _Directive);

  function EventDirective() {
    var _this;

    _this = _Directive.apply(this, arguments) || this;
    _this.event = '';
    return _this;
  }

  var _proto = EventDirective.prototype;

  _proto.onInit = function onInit() {
    var _getContext = getContext(this),
        module = _getContext.module,
        node = _getContext.node,
        parentInstance = _getContext.parentInstance,
        selector = _getContext.selector;

    var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
    var event$ = rxjs.fromEvent(node, event).pipe(operators.shareReplay(1));
    var expression = node.getAttribute("(" + event + ")");

    if (expression) {
      var outputFunction = module.makeFunction(expression, ['$event']);
      event$.pipe(operators.takeUntil(this.unsubscribe$)).subscribe(function (event) {
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
};var Structure = /*#__PURE__*/function (_Factory) {
  _inheritsLoose(Structure, _Factory);

  function Structure() {
    return _Factory.apply(this, arguments) || this;
  }

  return Structure;
}(Factory);var Component = /*#__PURE__*/function (_Factory) {
  _inheritsLoose(Component, _Factory);

  function Component() {
    return _Factory.apply(this, arguments) || this;
  }

  var _proto = Component.prototype;

  _proto.pushChanges = function pushChanges() {
    var _getContext = getContext(this),
        module = _getContext.module,
        node = _getContext.node;

    if (module.instances) {
      this.changes$.next(this);
      module.parse(node, this);
      this.onView();
    }
  };

  return Component;
}(Factory);var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];

var Context = /*#__PURE__*/function (_Component) {
  _inheritsLoose(Context, _Component);

  function Context(parentInstance, descriptors) {
    var _this;

    if (descriptors === void 0) {
      descriptors = {};
    }

    _this = _Component.call(this) || this;
    descriptors = Context.mergeDescriptors(parentInstance, parentInstance, descriptors);
    descriptors = Context.mergeDescriptors(Object.getPrototypeOf(parentInstance), parentInstance, descriptors);
    Object.defineProperties(_assertThisInitialized(_this), descriptors);
    return _this;
  }

  var _proto = Context.prototype;

  _proto.pushChanges = function pushChanges() {
    var _this2 = this;

    var context = getContext(this);

    if (!context.keys) {
      context.keys = Object.keys(context.parentInstance).filter(function (key) {
        return RESERVED_PROPERTIES.indexOf(key) === -1;
      }); // console.log(context.keys.join(','));
    }

    if (context.module.instances) {
      context.keys.forEach(function (key) {
        // console.log('Context', key, context.parentInstance);
        _this2[key] = context.parentInstance[key];
      });
    }

    _Component.prototype.pushChanges.call(this);
  };

  _proto.onParentDidChange = function onParentDidChange(changes) {
    this.onChanges(changes);
    this.pushChanges();
  };

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
}(Component);var ForItem = /*#__PURE__*/function (_Context) {
  _inheritsLoose(ForItem, _Context);

  // !!! todo: payload options { key, $key, value, $value, index, count }
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
}(Context);var ForStructure = /*#__PURE__*/function (_Structure) {
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
        node = _getContext.node;

    var forbegin = this.forbegin = document.createComment("*for begin");
    forbegin.rxcompId = node.rxcompId;
    node.parentNode.replaceChild(forbegin, node);
    var forend = this.forend = document.createComment("*for end");
    forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
    node.removeAttribute('*for');
  };

  _proto.onChanges = function onChanges() {
    var context = getContext(this);
    var module = context.module;
    var node = context.node;
    var tokens = this.tokens;
    var result = this[tokens.iterable];
    var isArray = Array.isArray(result);
    var array = isArray ? result : Object.keys(result);
    var total = array.length;
    var previous = this.instances.length;

    for (var i = 0; i < Math.max(previous, total); i++) {
      if (i < total) {
        var key = isArray ? i : array[i];
        var value = isArray ? array[key] : result[key];

        if (i < previous) {
          // update
          var instance = this.instances[i];
          instance[tokens.key] = key;
          instance[tokens.value] = value;
        } else {
          // create
          var clonedNode = node.cloneNode(true);
          delete clonedNode.rxcompId;
          this.forend.parentNode.insertBefore(clonedNode, this.forend);
          var args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance];
          var skipSubscription = true;

          var _instance = module.makeInstance(clonedNode, ForItem, context.selector, context.parentInstance, args, undefined, skipSubscription);

          if (_instance) {
            module.compile(clonedNode, _instance);
            module.makeInstanceSubscription(_instance, context.parentInstance);
            this.instances.push(_instance);
          }
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

    this.instances.length = array.length;
  };

  ForStructure.getInputsTokens = function getInputsTokens(instance) {
    var _getContext3 = getContext(instance),
        node = _getContext3.node;

    var expression = node.getAttribute('*for');
    var tokens = instance.tokens = ForStructure.getForExpressionTokens(expression);
    return [tokens.iterable];
  };

  ForStructure.getForExpressionTokens = function getForExpressionTokens(expression) {
    if (expression === null) {
      throw new Error('invalid for');
    }

    if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
      throw new Error('invalid for');
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
  selector: '[*for]',
  inputs: ['for']
};var HrefDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(HrefDirective, _Directive);

  function HrefDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  _createClass(HrefDirective, [{
    key: "href",
    set: function set(href) {
      if (this.href_ !== href) {
        this.href_ = href;

        var _getContext = getContext(this),
            node = _getContext.node;

        href ? node.setAttribute('href', href) : node.removeAttribute('href');
      }
    },
    get: function get() {
      return this.href_;
    }
  }]);

  return HrefDirective;
}(Directive);
HrefDirective.meta = {
  selector: '[[href]]',
  inputs: ['href']
};var IfStructure = /*#__PURE__*/function (_Structure) {
  _inheritsLoose(IfStructure, _Structure);

  function IfStructure() {
    return _Structure.apply(this, arguments) || this;
  }

  var _proto = IfStructure.prototype;

  _proto.onInit = function onInit() {
    var _getContext = getContext(this),
        node = _getContext.node;

    var ifbegin = this.ifbegin = document.createComment("*if begin");
    ifbegin.rxcompId = node.rxcompId;
    node.parentNode.replaceChild(ifbegin, node);
    var ifend = this.ifend = document.createComment("*if end");
    ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
    var clonedNode = node.cloneNode(true);
    clonedNode.removeAttribute('*if');
    this.clonedNode = clonedNode;
    this.element = clonedNode.cloneNode(true);
  };

  _proto.onChanges = function onChanges() {
    var _getContext2 = getContext(this),
        module = _getContext2.module;

    var element = this.element; // console.log('IfStructure.onChanges.if', this.if);

    if (Boolean(this.if)) {
      // !!! keep == loose equality
      if (!element.parentNode) {
        var ifend = this.ifend;
        ifend.parentNode.insertBefore(element, ifend);
        module.compile(element); // console.log('IfStructure.onChanges.add', element);
      }
    } else {
      if (element.parentNode) {
        module.remove(element, this);
        element.parentNode.removeChild(element);
        this.element = this.clonedNode.cloneNode(true); // console.log('IfStructure.onChanges.remove', element);
      }
    }
  };

  return IfStructure;
}(Structure);
IfStructure.meta = {
  selector: '[*if]',
  inputs: ['if']
};var InnerHtmlDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(InnerHtmlDirective, _Directive);

  function InnerHtmlDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  _createClass(InnerHtmlDirective, [{
    key: "innerHTML",
    set: function set(innerHTML) {
      if (this.innerHTML_ !== innerHTML) {
        this.innerHTML_ = innerHTML;

        var _getContext = getContext(this),
            node = _getContext.node;

        node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
      }
    },
    get: function get() {
      return this.innerHTML_;
    }
  }]);

  return InnerHtmlDirective;
}(Directive);
InnerHtmlDirective.meta = {
  selector: "[innerHTML]",
  inputs: ['innerHTML']
};var JsonComponent = /*#__PURE__*/function (_Component) {
  _inheritsLoose(JsonComponent, _Component);

  function JsonComponent() {
    var _this;

    _this = _Component.apply(this, arguments) || this;
    _this.active = false;
    return _this;
  }

  var _proto = JsonComponent.prototype;

  _proto.onToggle = function onToggle() {
    this.active = !this.active;
    this.pushChanges();
  };

  return JsonComponent;
}(Component);
JsonComponent.meta = {
  selector: 'json-component',
  inputs: ['item'],
  template:
  /* html */
  "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ json </span>\n\t\t\t\t\t<span *if=\"active\">- json </span>\n\t\t\t\t\t<span [innerHTML]=\"item\"></span>\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\">\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item | json\"></span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>"
};var Pipe = /*#__PURE__*/function () {
  function Pipe() {}

  Pipe.transform = function transform(value) {
    return value;
  };

  return Pipe;
}();var ORDER = [Structure, Component, Directive];

var Platform = /*#__PURE__*/function () {
  function Platform() {}

  /**
   * @param moduleFactory
   * @description This method returns an uncompiled module
   */
  Platform.bootstrap = function bootstrap(moduleFactory) {
    if (!moduleFactory) {
      throw new ModuleError('missing moduleFactory');
    }

    if (!moduleFactory.meta) {
      throw new ModuleError('missing moduleFactory meta');
    }

    if (!moduleFactory.meta.bootstrap) {
      throw new ModuleError('missing bootstrap');
    }

    if (!moduleFactory.meta.bootstrap.meta) {
      throw new ModuleError('missing bootstrap meta');
    }

    if (!moduleFactory.meta.bootstrap.meta.selector) {
      throw new ModuleError('missing bootstrap meta selector');
    }

    var meta = this.resolveMeta(moduleFactory);
    var module = new moduleFactory();
    module.meta = meta;
    meta.imports.forEach(function (moduleFactory) {
      moduleFactory.prototype.constructor.call(module);
    });
    return module;
  };

  Platform.querySelector = function querySelector(selector) {
    return document.querySelector(selector);
  };

  Platform.resolveMeta = function resolveMeta(moduleFactory) {
    var meta = this.resolveImportedMeta(moduleFactory);
    var bootstrap = moduleFactory.meta.bootstrap;
    var node = this.querySelector(bootstrap.meta.selector);

    if (!node) {
      throw new ModuleError("missing node " + bootstrap.meta.selector);
    }

    var nodeInnerHTML = node.innerHTML;
    var pipes = this.resolvePipes(meta);
    var factories = this.resolveFactories(meta);
    this.sortFactories(factories);
    factories.unshift(bootstrap);
    var selectors = this.unwrapSelectors(factories);
    return {
      factories: factories,
      pipes: pipes,
      selectors: selectors,
      bootstrap: bootstrap,
      node: node,
      nodeInnerHTML: nodeInnerHTML,
      imports: moduleFactory.meta.imports || []
    };
  };

  Platform.resolveImportedMeta = function resolveImportedMeta(moduleFactory) {
    var _this = this;

    var meta = Object.assign({
      imports: [],
      declarations: [],
      pipes: [],
      exports: []
    }, moduleFactory.meta);
    meta.imports = (moduleFactory.meta.imports || []).map(function (moduleFactory) {
      return _this.resolveImportedMeta(moduleFactory);
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
      return x.prototype instanceof Factory;
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

      return '';
    });
    return matchers;
  };

  Platform.unwrapSelectors = function unwrapSelectors(factories) {
    var _this4 = this;

    var selectors = [];
    factories.forEach(function (factory) {
      if (factory.meta && factory.meta.selector) {
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
      }
    });
    return selectors;
  };

  return Platform;
}();
var PLATFORM_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
/* eslint-disable no-undef */

var PLATFORM_JS_DOM = typeof window !== 'undefined' && window.name === 'nodejs' || typeof navigator !== 'undefined' && navigator.userAgent.includes('Node.js') || typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
/* eslint-enable no-undef */

var PLATFORM_NODE = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
/* eslint-disable no-restricted-globals */

var PLATFORM_WEB_WORKER = typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';
var isPlatformServer = PLATFORM_NODE;
var isPlatformBrowser = !PLATFORM_NODE && PLATFORM_BROWSER;
var isPlatformWorker = PLATFORM_WEB_WORKER;/**
 * @example Serializer.encode(value, [encodeJson, encodeUriComponent, encodeBase64]);
 * @example Serializer.decode(value, [decodeBase64, decodeUriComponent, decodeJson]);
 */

var Serializer = /*#__PURE__*/function () {
  function Serializer() {}

  Serializer.encode = function encode(value, encoders) {
    if (encoders === void 0) {
      encoders = [_encodeJson];
    }

    return encoders.reduce(function (p, c) {
      return c(p);
    }, value);
  };

  Serializer.decode = function decode(value, decoders) {
    if (decoders === void 0) {
      decoders = [_decodeJson];
    }

    return decoders.reduce(function (p, c) {
      return c(p);
    }, value);
  };

  Serializer.encodeJson = function encodeJson(value) {
    return this.encode(value, [_encodeJson]);
  };

  Serializer.decodeJson = function decodeJson(value) {
    return this.decode(value, [_decodeJson]);
  };

  Serializer.encodeBase64 = function encodeBase64(value) {
    return this.encode(value, [_encodeJson, _encodeBase]);
  };

  Serializer.decodeBase64 = function decodeBase64(value) {
    return this.decode(value, [_decodeBase, _decodeJson]);
  };

  return Serializer;
}();

function _encodeJson(value, circularRef, space) {
  var decoded;

  try {
    // const pool: Map<any, boolean> = new Map();
    var pool = [];
    var json = JSON.stringify(value, function (key, value) {
      if (typeof value === 'object' && value != null) {
        // if (pool.has(value)) {
        if (pool.indexOf(value) !== -1) {
          // console.warn(`Serializer.encodeJson.error`, `circular reference found, discard key "${key}"`);
          return circularRef;
        }

        pool.push(value); // pool.set(value, true);
      }

      return value;
    }, space);
    decoded = json;
  } catch (error) {// console.warn(`Serializer.encodeJson.error`, value, error);
  }

  return decoded;
}
function encodeJsonWithOptions(circularRef, space) {
  return function (value) {
    return _encodeJson(value, circularRef, space);
  };
}

function _decodeJson(value) {
  var decoded;

  if (value) {
    try {
      decoded = JSON.parse(value);
    } catch (error) {// console.warn(`Serializer.decodeJson.error`, value, error);
    }
  }

  return decoded;
}

function _encodeBase(value) {
  var encoded;

  try {
    encoded = isPlatformBrowser ? btoa(value) : Buffer.from(value).toString('base64');
  } catch (error) {
    encoded = value;
  }

  return encoded;
}

function _decodeBase(value) {
  var decoded;

  try {
    decoded = isPlatformBrowser ? atob(value) : Buffer.from(value, 'base64').toString();
  } catch (error) {
    decoded = value;
  }

  return decoded;
}var JsonPipe = /*#__PURE__*/function (_Pipe) {
  _inheritsLoose(JsonPipe, _Pipe);

  function JsonPipe() {
    return _Pipe.apply(this, arguments) || this;
  }

  JsonPipe.transform = function transform(value) {
    return Serializer.encode(value, [encodeJsonWithOptions('#ref', 2)]);
  };

  return JsonPipe;
}(Pipe);
JsonPipe.meta = {
  name: 'json'
};var WINDOW = typeof self === 'object' && self.self === self && self || typeof global === 'object' && global.global === global && global || undefined;var ID = 0;

var Module = /*#__PURE__*/function () {
  function Module() {
    this.unsubscribe$ = new rxjs.Subject();
  }

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
      return x !== undefined;
    }); // instances.forEach(x => x.onInit());
    // console.log('compile', instances, node, parentInstance);

    return instances;
  };

  _proto.makeInstance = function makeInstance(node, factory, selector, parentInstance, args, inject, skipSubscription) {
    if (skipSubscription === void 0) {
      skipSubscription = false;
    }

    if (parentInstance || node.parentNode) {
      var meta = factory.meta; // collect parentInstance scope

      parentInstance = parentInstance || this.getParentInstance(node.parentNode);

      if (!parentInstance) {
        return undefined;
      } // creating factory instance


      var instance = _construct(factory, args || []); // injecting custom properties


      if (inject) {
        Object.keys(inject).forEach(function (key) {
          // console.log('Module.makeInstance', key, inject[key]);
          Object.defineProperty(instance, key, {
            value: inject[key],
            configurable: false,
            enumerable: false,
            writable: true
          });
        });
      } // creating instance context


      var context = Module.makeContext(this, instance, parentInstance, node, factory, selector); // creating component input and outputs

      if (!(instance instanceof Context)) {
        this.makeHosts(meta, instance, node);
        context.inputs = this.makeInputs(meta, instance, factory);
        context.outputs = this.makeOutputs(meta, instance);

        if (parentInstance instanceof Factory) {
          this.resolveInputsOutputs(instance, parentInstance);
        }
      } // calling onInit event


      instance.onInit(); // subscribe to parent changes

      if (!skipSubscription) {
        this.makeInstanceSubscription(instance, parentInstance);
      }

      return instance;
    } else {
      return undefined;
    }
  };

  _proto.makeInstanceSubscription = function makeInstanceSubscription(instance, parentInstance) {
    if (parentInstance instanceof Factory) {
      parentInstance.changes$.pipe( // distinctUntilChanged(deepEqual),
      operators.takeUntil(instance.unsubscribe$)).subscribe(function (changes) {
        instance.onParentDidChange(changes);
      });
    }
  };

  _proto.makeFunction = function makeFunction(expression, params) {
    if (params === void 0) {
      params = ['$instance'];
    }

    expression = Module.parseExpression(expression);
    var expressionFunction = "with(this) {\n\treturn (function (" + params.join(',') + ", $$module) {\n\t\ttry {\n\t\t\tconst $$pipes = $$module.meta.pipes;\n\t\t\treturn " + expression + ";\n\t\t} catch(error) {\n\t\t\t$$module.nextError(error, this, " + JSON.stringify(expression) + ", arguments);\n\t\t}\n\t}.bind(this)).apply(this, arguments);\n}"; // console.log('Module.makeFunction.expressionFunction', expressionFunction);

    return new Function(expressionFunction); // return () => { return null; };
  };

  _proto.resolveInputsOutputs = function resolveInputsOutputs(instance, changes) {
    var context = getContext(instance);
    var parentInstance = context.parentInstance;
    var inputs = context.inputs;

    for (var key in inputs) {
      var inputFunction = inputs[key];
      var value = this.resolve(inputFunction, parentInstance, instance); // console.log('Module.resolveInputsOutputs', 'key', key, 'inputFunction', inputFunction, 'parentInstance', parentInstance, 'instance', instance);

      instance[key] = value;
    }
  };

  _proto.resolve = function resolve(expression, parentInstance, payload) {
    // console.log('Module.resolve', expression, parentInstance, payload, getContext);
    return expression.apply(parentInstance, [payload, this]);
  };

  _proto.parse = function parse(node, instance) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];

      if (child.nodeType === 1) {
        var element = child;
        var context = getParsableContextByElement(element);

        if (!context) {
          this.parse(element, instance);
        }
      } else if (child.nodeType === 3) {
        var text = child;
        this.parseTextNode(text, instance);
      }
    }
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

  _proto.destroy = function destroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.remove(this.meta.node);
    this.meta.node.innerHTML = this.meta.nodeInnerHTML;
  };

  _proto.nextError = function nextError(error, instance, expression, params) {
    var expressionError = new ExpressionError(error, this, instance, expression, params);
    nextError$.next(expressionError);
  };

  _proto.makeContext = function makeContext(instance, parentInstance, node, selector) {
    var context = Module.makeContext(this, instance, parentInstance, node, instance.constructor, selector); // console.log('Module.makeContext', context, context.instance, context.node);

    return context;
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
    // console.log('Module.makeInput', 'key', key, 'instance', instance);
    var _getContext = getContext(instance),
        node = _getContext.node;

    var input = null,
        expression = null;

    if (node.hasAttribute("[" + key + "]")) {
      expression = node.getAttribute("[" + key + "]"); // console.log('Module.makeInput.expression.1', expression);
    } else if (node.hasAttribute("*" + key)) {
      expression = node.getAttribute("*" + key); // console.log('Module.makeInput.expression.2', expression);
    } else if (node.hasAttribute(key)) {
      expression = node.getAttribute(key);

      if (expression) {
        var attribute = expression.replace(/({{)|(}})|(")/g, function (substring, a, b, c) {
          if (a) {
            return '"+';
          }

          if (b) {
            return '+"';
          }

          if (c) {
            return '\"';
          }

          return '';
        });
        expression = "\"" + attribute + "\""; // console.log('Module.makeInput.expression.3', expression);
      }
    }

    expression = expression || key; // if (expression) {

    instance[key] = instance[key] === undefined ? null : instance[key]; // !!! avoid throError undefined key

    input = this.makeFunction(expression); // }
    // console.log('Module.makeInput', key, expression);

    return input;
  };

  _proto.makeInputs = function makeInputs(meta, instance, factory) {
    var _this2 = this;

    var inputs = {};
    factory.getInputsTokens(instance).forEach(function (key) {
      var input = _this2.makeInput(instance, key);

      if (input) {
        inputs[key] = input;
      }
    });
    return inputs;
  };

  _proto.makeOutput = function makeOutput(instance, key) {
    var _this3 = this;

    var context = getContext(instance);
    var node = context.node;
    var parentInstance = context.parentInstance;
    var expression = node.getAttribute("(" + key + ")");
    var outputExpression = expression ? this.makeFunction(expression, ['$event']) : null;
    var output$ = new rxjs.Subject().pipe(operators.tap(function (event) {
      if (outputExpression) {
        // console.log(expression, parentInstance);
        _this3.resolve(outputExpression, parentInstance, event);
      }
    }));
    output$.pipe(operators.takeUntil(instance.unsubscribe$)).subscribe();
    instance[key] = output$;
    return output$;
  };

  _proto.makeOutputs = function makeOutputs(meta, instance) {
    var _this4 = this;

    var outputs = {};

    if (meta.outputs) {
      meta.outputs.forEach(function (key) {
        var output = _this4.makeOutput(instance, key);

        if (output) {
          outputs[key] = output;
        }
      });
    }

    return outputs;
  };

  _proto.getInstance = function getInstance(node) {
    if (node === document) {
      return WINDOW; // (isPlatformBrowser ? window : global) as Window;
    }

    var context = getContextByNode(node);

    if (context) {
      return context.instance;
    } else {
      return undefined;
    }
  };

  _proto.getParentInstance = function getParentInstance(node) {
    var _this5 = this;

    return Module.traverseUp(node, function (node) {
      return _this5.getInstance(node);
    });
  };

  _proto.parseTextNode = function parseTextNode(node, instance) {
    var _this6 = this;

    var expressions = node.nodeExpressions;

    if (!expressions) {
      expressions = this.parseTextNodeExpression(node.wholeText);
    }

    if (expressions.length) {
      var replacedText = expressions.reduce(function (p, c) {
        var text;

        if (typeof c === 'function') {
          // instanceOf ExpressionFunction ?;
          // console.log('Module.parseTextNode', c, instance);
          text = _this6.resolve(c, instance, instance);

          if (text == undefined) {
            // !!! keep == loose equality
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
    } else {
      node.nodeExpressions = expressions;
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

      if (matches[1]) {
        var expression = this.makeFunction(matches[1]);
        expressions.push(expression);
      }
    } // console.log('Module.parseTextNodeExpression', regex.source, expressions, nodeValue);


    var length = nodeValue.length;

    if (length > lastIndex) {
      this.pushFragment(nodeValue, lastIndex, length, expressions);
    }

    if (expressions.find(function (x) {
      return typeof x === 'function';
    })) {
      return expressions;
    } else {
      return [];
    }
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
    var l = '┌';
    var r = '┘';
    var rx1 = /(.*?[^\|])\|([^\|]+)/;

    while (expression.match(rx1)) {
      expression = expression.replace(rx1, function (substring) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var value = args[0].trim();
        var params = Module.parsePipeParams(args[1]);
        var func = params.shift().trim();
        return "$$pipes." + func + ".transform" + l + [value].concat(params) + r;
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
          instance.onDestroy();
          delete CONTEXTS[instance.rxcompId];
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
          // console.log('Structure', node);
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
function getParsableContextByElement(element) {
  var context;
  var rxcompId = element.rxcompId;

  if (rxcompId) {
    var contexts = NODES[rxcompId];

    if (contexts) {
      context = contexts.reduce(function (previous, current) {
        if (current.instance instanceof Context) {
          return previous ? previous : current;
        } else if (current.instance instanceof Component) {
          return current;
        } else {
          return previous;
        }
      }, undefined);
    } // context = contexts ? contexts.find(x => x.instance instanceof Component) : undefined;

  }

  return context;
}
function getContextByNode(element) {
  var context = getParsableContextByElement(element);

  if (context && context.factory.prototype instanceof Structure) {
    return undefined;
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
  } else {
    return undefined;
  }
}
/*
export function deepEqual(prev: any, curr: any, pool: any[] = []): boolean {
    let equal: boolean = typeof prev === typeof curr;
    if (prev && pool.indexOf(prev) === -1 && pool.indexOf(curr) === -1) {
        pool.push(prev, curr);
        const type = Array.isArray(curr) ? 'array' : typeof curr;
        switch (type) {
            case 'array':
                equal = prev.length === curr.length;
                equal = equal && prev.reduce((p: boolean, a: any[], i: number) => p && deepEqual(a, curr[i], pool), true);
                break;
            case 'object':
                if ('Symbol' in WINDOW && Symbol.iterator in prev) {
                    // || prev instanceof Map
                    equal = prev.size === curr.size;
                    const ea = prev.entries();
                    const eb = curr.entries();
                    for (let item = ea.next(); item.done !== true; item = ea.next()) {
                        const ia = item.value;
                        const ib = eb.next().value;
                        equal = equal && deepEqual(ia, ib, pool);
                    }
                } else {
                    const prevKeys = Object.keys(prev);
                    const currKeys = Object.keys(curr);
                    equal = prevKeys.length === currKeys.length;
                    equal = equal && prevKeys.reduce((p: boolean, k: string) => p && deepEqual(prev[k], curr[k], pool), true);
                }
                break;
            default:
                equal = prev === curr;
        }
    }
    // console.log(equal, prev, curr);
    return equal;
}
*/var SrcDirective = /*#__PURE__*/function (_Directive) {
  _inheritsLoose(SrcDirective, _Directive);

  function SrcDirective() {
    return _Directive.apply(this, arguments) || this;
  }

  _createClass(SrcDirective, [{
    key: "src",
    set: function set(src) {
      if (this.src_ !== src) {
        this.src_ = src;

        var _getContext = getContext(this),
            node = _getContext.node;

        src ? node.setAttribute('src', src) : node.removeAttribute('src');
      }
    },
    get: function get() {
      return this.src_;
    }
  }]);

  return SrcDirective;
}(Directive);
SrcDirective.meta = {
  selector: '[[src]]',
  inputs: ['src']
};var StyleDirective = /*#__PURE__*/function (_Directive) {
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

          var value = style[_key] + (_splitted.length ? _splitted[0] : ''); // console.log(propertyName, value, style, key, style[key]);

          node.style.setProperty(_propertyName, value);
        }
      }
    }

    this.previousStyle = style; // console.log('StyleDirective.onChanges', style);
  };

  return StyleDirective;
}(Directive);
StyleDirective.meta = {
  selector: "[[style]]",
  inputs: ['style']
};var factories = [ClassDirective, EventDirective, ForStructure, HrefDirective, IfStructure, InnerHtmlDirective, JsonComponent, SrcDirective, StyleDirective];
var pipes = [JsonPipe];

var CoreModule = /*#__PURE__*/function (_Module) {
  _inheritsLoose(CoreModule, _Module);

  function CoreModule() {
    var _this;

    _this = _Module.call(this) || this; // console.log('CoreModule');

    errors$.pipe(operators.takeUntil(_this.unsubscribe$)).subscribe();
    return _this;
  }

  return CoreModule;
}(Module);
CoreModule.meta = {
  declarations: [].concat(factories, pipes),
  exports: [].concat(factories, pipes)
};var Browser = /*#__PURE__*/function (_Platform) {
  _inheritsLoose(Browser, _Platform);

  function Browser() {
    return _Platform.apply(this, arguments) || this;
  }

  /**
   * @param moduleFactory
   * @description This method returns a Browser compiled module
   */
  Browser.bootstrap = function bootstrap(moduleFactory) {
    if (!isPlatformBrowser) {
      throw new ModuleError('missing platform browser, Window not found');
    }

    if (!moduleFactory) {
      throw new ModuleError('missing moduleFactory');
    }

    if (!moduleFactory.meta) {
      throw new ModuleError('missing moduleFactory meta');
    }

    if (!moduleFactory.meta.bootstrap) {
      throw new ModuleError('missing bootstrap');
    }

    if (!moduleFactory.meta.bootstrap.meta) {
      throw new ModuleError('missing bootstrap meta');
    }

    if (!moduleFactory.meta.bootstrap.meta.selector) {
      throw new ModuleError('missing bootstrap meta selector');
    }

    var meta = this.resolveMeta(moduleFactory);
    var module = new moduleFactory();
    module.meta = meta;
    meta.imports.forEach(function (moduleFactory) {
      moduleFactory.prototype.constructor.call(module);
    });

    if (WINDOW.rxcomp_hydrate_) {
      var _meta$node$parentNode;

      var clonedNode = meta.node.cloneNode();
      clonedNode.innerHTML = meta.nodeInnerHTML = WINDOW.rxcomp_hydrate_.innerHTML;
      var instances = module.compile(clonedNode, WINDOW);
      module.instances = instances;
      var root = instances[0];
      root.pushChanges();
      (_meta$node$parentNode = meta.node.parentNode) == null ? void 0 : _meta$node$parentNode.replaceChild(clonedNode, meta.node);
    } else {
      var _instances = module.compile(meta.node, WINDOW);

      module.instances = _instances;
      var _root = _instances[0];

      _root.pushChanges();
    }

    return module;
  };

  return Browser;
}(Platform);function getLocationComponents(href) {
  var protocol = '';
  var host = '';
  var hostname = '';
  var port = '';
  var pathname = '';
  var search = '';
  var hash = '';
  var regExp = /^((http\:|https\:)?\/\/)?((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])|locahost)?(\:([^\/]+))?(\.?\/[^\?]+)?(\?[^\#]+)?(\#.+)?$/g;
  var matches = href.matchAll(regExp);

  for (var _iterator = _createForOfIteratorHelperLoose(matches), _step; !(_step = _iterator()).done;) {
    var match = _step.value;
    protocol = match[2] || '';
    host = hostname = match[3] || '';
    port = match[11] || '';
    pathname = match[12] || '';
    search = match[13] || '';
    hash = match[14] || '';
  }

  return {
    href: href,
    protocol: protocol,
    host: host,
    hostname: hostname,
    port: port,
    pathname: pathname,
    search: search,
    hash: hash
  };
}var TransferService = /*#__PURE__*/function () {
  function TransferService() {}

  TransferService.makeKey = function makeKey(base, params) {
    var paramsKey = params ? optionsToKey(params) : '';
    var key = "rxcomp-hydrate-" + base + "-" + paramsKey;
    key = key.replace(/(\s+)|(\W+)/g, function () {
      return (arguments.length <= 1 ? undefined : arguments[1]) ? '' : '_';
    }); // console.log('TransferService.makeKey', key, base, paramsKey);

    return key;
  };

  TransferService.has = function has(key) {
    var script = document.querySelector("#" + key);
    return script !== null;
  };

  TransferService.get = function get(key) {
    var node = document.querySelector("#" + key);

    if (node && node.firstChild) {
      var json = node.firstChild.nodeValue;
      return json ? Serializer.decode(json, [_decodeJson]) : undefined;
    } else {
      return undefined;
    }
  };

  TransferService.set = function set(key, value) {
    // console.log('TransferService.set', key, value);
    var json = Serializer.encode(value, [_encodeJson]);

    if (!json) {
      return;
    }

    var text = document.createTextNode(json);
    var node = document.querySelector("#" + key);

    if (!node) {
      node = document.createElement('script');
      node.setAttribute('id', key);
      node.setAttribute('type', 'text/template'); // console.log('node', node!!, 'document', document!!, 'head', document.head!!);

      node.append(text);
      document.head.append(node);
    } else {
      node.replaceChild(text, node.firstChild);
    }
  };

  TransferService.remove = function remove(key) {
    var node = document.querySelector("#" + key);

    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  };

  return TransferService;
}();
function optionsToKey(v, s) {
  if (s === void 0) {
    s = '';
  }

  if (typeof v === 'number') {
    s += '-' + v.toString();
  } else if (typeof v === 'string') {
    s += '-' + v.substr(0, 20);
  } else if (v && Array.isArray(v)) {
    s += '-' + v.map(function (v) {
      return optionsToKey(v);
    }).join('');
  } else if (v && typeof v === 'object') {
    s += '-' + Object.keys(v).map(function (k) {
      return k + optionsToKey(v[k]);
    }).join('-');
  }

  return s;
}exports.Browser=Browser;exports.ClassDirective=ClassDirective;exports.Component=Component;exports.Context=Context;exports.CoreModule=CoreModule;exports.DefaultErrorHandler=DefaultErrorHandler;exports.Directive=Directive;exports.ErrorInterceptorHandler=ErrorInterceptorHandler;exports.ErrorInterceptors=ErrorInterceptors;exports.EventDirective=EventDirective;exports.ExpressionError=ExpressionError;exports.Factory=Factory;exports.ForItem=ForItem;exports.ForStructure=ForStructure;exports.HrefDirective=HrefDirective;exports.IfStructure=IfStructure;exports.InnerHtmlDirective=InnerHtmlDirective;exports.JsonComponent=JsonComponent;exports.JsonPipe=JsonPipe;exports.Module=Module;exports.ModuleError=ModuleError;exports.PLATFORM_BROWSER=PLATFORM_BROWSER;exports.PLATFORM_JS_DOM=PLATFORM_JS_DOM;exports.PLATFORM_NODE=PLATFORM_NODE;exports.PLATFORM_WEB_WORKER=PLATFORM_WEB_WORKER;exports.Pipe=Pipe;exports.Platform=Platform;exports.Serializer=Serializer;exports.SrcDirective=SrcDirective;exports.Structure=Structure;exports.StyleDirective=StyleDirective;exports.TransferService=TransferService;exports.WINDOW=WINDOW;exports.decodeBase64=_decodeBase;exports.decodeJson=_decodeJson;exports.encodeBase64=_encodeBase;exports.encodeJson=_encodeJson;exports.encodeJsonWithOptions=encodeJsonWithOptions;exports.errors$=errors$;exports.getContext=getContext;exports.getContextByNode=getContextByNode;exports.getHost=getHost;exports.getLocationComponents=getLocationComponents;exports.getParsableContextByElement=getParsableContextByElement;exports.isPlatformBrowser=isPlatformBrowser;exports.isPlatformServer=isPlatformServer;exports.isPlatformWorker=isPlatformWorker;exports.nextError$=nextError$;exports.optionsToKey=optionsToKey;Object.defineProperty(exports,'__esModule',{value:true});})));