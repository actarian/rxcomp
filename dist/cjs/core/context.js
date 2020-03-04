"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import { BehaviorSubject, Subject } from 'rxjs';
var component_1 = tslib_1.__importDefault(require("./component"));
var RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
var Context = /** @class */ (function (_super) {
    tslib_1.__extends(Context, _super);
    function Context(instance, descriptors) {
        if (descriptors === void 0) { descriptors = {}; }
        var _this = _super.call(this) || this;
        descriptors = Context.mergeDescriptors(instance, instance, descriptors);
        descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
        Object.defineProperties(_this, descriptors);
        return _this;
    }
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
