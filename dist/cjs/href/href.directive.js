"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var HrefDirective = /** @class */ (function (_super) {
    tslib_1.__extends(HrefDirective, _super);
    function HrefDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(HrefDirective.prototype, "href", {
        get: function () {
            return this.href_;
        },
        set: function (href) {
            if (this.href_ !== href) {
                this.href_ = href;
                var node = factory_1.getContext(this).node;
                href ? node.setAttribute('href', href) : node.removeAttribute('href');
            }
        },
        enumerable: false,
        configurable: true
    });
    return HrefDirective;
}(directive_1.default));
exports.default = HrefDirective;
HrefDirective.meta = {
    selector: '[[href]]',
    inputs: ['href'],
};
