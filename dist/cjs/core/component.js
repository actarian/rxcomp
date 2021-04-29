"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var factory_1 = tslib_1.__importStar(require("./factory"));
var Component = /** @class */ (function (_super) {
    tslib_1.__extends(Component, _super);
    function Component() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Component.prototype.pushChanges = function () {
        var _a = factory_1.getContext(this), module = _a.module, node = _a.node, childInstances = _a.childInstances;
        var instances = childInstances.slice();
        // try {
        var instance;
        for (var i = 0, len = instances.length; i < len; i++) {
            instance = instances[i];
            if (childInstances.indexOf(instance) !== -1) {
                instances[i].onParentDidChange(this);
            }
        }
        // this.changes$.next(this);
        module.parse(node, this);
        this.onView();
        // } catch (error) {
        //	console.log('Component.error', error, this);
        //	throw error;
        // }
    };
    return Component;
}(factory_1.default));
exports.default = Component;
