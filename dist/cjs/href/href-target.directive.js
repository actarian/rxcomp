"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var HrefTargetDirective = /** @class */ (function (_super) {
    tslib_1.__extends(HrefTargetDirective, _super);
    function HrefTargetDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(HrefTargetDirective.prototype, "target", {
        get: function () {
            return this.target_;
        },
        set: function (target) {
            if (this.target_ !== target) {
                this.target_ = target;
                var node = factory_1.getContext(this).node;
                target ? node.setAttribute('target', target) : node.removeAttribute('target');
            }
        },
        enumerable: false,
        configurable: true
    });
    HrefTargetDirective.meta = {
        selector: '[[target]]',
        inputs: ['target'],
    };
    return HrefTargetDirective;
}(directive_1.default));
exports.default = HrefTargetDirective;
