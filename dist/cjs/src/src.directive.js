"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var SrcDirective = /** @class */ (function (_super) {
    tslib_1.__extends(SrcDirective, _super);
    function SrcDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SrcDirective.prototype, "src", {
        get: function () {
            return this.src_;
        },
        set: function (src) {
            if (this.src_ !== src) {
                this.src_ = src;
                var node = factory_1.getContext(this).node;
                src ? node.setAttribute('src', src) : node.removeAttribute('src');
            }
        },
        enumerable: false,
        configurable: true
    });
    SrcDirective.meta = {
        selector: '[[src]]',
        inputs: ['src'],
    };
    return SrcDirective;
}(directive_1.default));
exports.default = SrcDirective;
