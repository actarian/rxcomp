"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import { BehaviorSubject, Subject } from 'rxjs';
var component_1 = tslib_1.__importDefault(require("./component"));
var factory_1 = require("./factory");
var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
var Context = /** @class */ (function (_super) {
    tslib_1.__extends(Context, _super);
    function Context(parentInstance, descriptors) {
        if (descriptors === void 0) { descriptors = {}; }
        var _this = _super.call(this) || this;
        descriptors = Context.mergeDescriptors(parentInstance, parentInstance, descriptors);
        descriptors = Context.mergeDescriptors(Object.getPrototypeOf(parentInstance), parentInstance, descriptors);
        Object.defineProperties(_this, descriptors);
        return _this;
    }
    Context.prototype.pushChanges = function () {
        var _this = this;
        var context = factory_1.getContext(this);
        if (!context.keys) {
            context.keys = Object.keys(context.parentInstance).filter(function (key) { return RESERVED_PROPERTIES.indexOf(key) === -1; });
            // console.log(context.keys.join(','));
        }
        if (context.module.instances) {
            context.keys.forEach(function (key) {
                // console.log('Context', key, context.parentInstance);
                _this[key] = context.parentInstance[key];
            });
        }
        _super.prototype.pushChanges.call(this);
    };
    Context.prototype.onParentDidChange = function (changes) {
        this.onChanges(changes);
        this.pushChanges();
    };
    Context.mergeDescriptors = function (source, instance, descriptors) {
        if (descriptors === void 0) { descriptors = {}; }
        var properties = Object.getOwnPropertyNames(source);
        var _loop_1 = function () {
            var key = properties.shift();
            if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
                var descriptor = Object.getOwnPropertyDescriptor(source, key);
                if (typeof descriptor.value == 'function') {
                    descriptor.value = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return instance[key].apply(instance, args);
                    };
                }
                descriptors[key] = descriptor;
            }
        };
        while (properties.length) {
            _loop_1();
        }
        return descriptors;
    };
    return Context;
}(component_1.default));
exports.default = Context;
