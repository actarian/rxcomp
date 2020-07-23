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
        var _a = factory_1.getContext(this), module = _a.module, node = _a.node;
        if (module.instances) {
            // console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
            this.changes$.next(this);
            // console.log('Module.parse', instance.constructor.name);
            // parse component text nodes
            module.parse(node, this);
            // calling onView event
            this.onView();
        }
    };
    return Component;
}(factory_1.default));
exports.default = Component;
