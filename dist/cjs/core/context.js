"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import { BehaviorSubject, Subject } from 'rxjs';
var component_1 = tslib_1.__importDefault(require("./component"));
// const RESERVED_PROPERTIES = ['constructor', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
var Context = /** @class */ (function (_super) {
    tslib_1.__extends(Context, _super);
    // constructor(parentInstance: Factory, descriptors: { [key: string]: PropertyDescriptor } = {}) {
    function Context(parentInstance) {
        var _this = _super.call(this) || this;
        _this.parentInstance = parentInstance;
        return _this;
        /*
        descriptors = Context.mergeDescriptors(parentInstance, parentInstance, descriptors);
        descriptors = Context.mergeDescriptors(Object.getPrototypeOf(parentInstance), parentInstance, descriptors);
        Object.defineProperties(this, descriptors);
        */
    }
    /*
    pushChanges(): void {
        const context = getContext(this);
        if (!context.keys) {
            context.keys = [];
            // context.keys = Object.keys(context.parentInstance).filter(key => RESERVED_PROPERTIES.indexOf(key) === -1);
            for (let i:number = 0, keys = Object.keys(context.parentInstance), len = keys.length; i < len; i++) {
                const key = keys[i];
                if (RESERVED_PROPERTIES.indexOf(key) === -1) {
                    context.keys.push(key);
                }
            }
            // console.log(context.keys.join(','));
        }
        if (context.module.instances) {
            context.keys.forEach(key => {
                // console.log('Context', key, context.parentInstance);
                this[key] = context.parentInstance[key];
            });
        }
        super.pushChanges();
    }
    */
    Context.prototype.onParentDidChange = function (changes) {
        this.onChanges(changes);
        this.pushChanges();
    };
    return Context;
}(component_1.default));
exports.default = Context;
