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
        if (module.instances) {
            for (var i = 0, len = childInstances.length; i < len; i++) {
                childInstances[i].onParentDidChange(this);
            }
            // this.changes$.next(this);
            module.parse(node, this);
            this.onView();
        }
    };
    return Component;
}(factory_1.default));
exports.default = Component;
