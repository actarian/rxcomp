"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var InnerHtmlDirective = /** @class */ (function (_super) {
    tslib_1.__extends(InnerHtmlDirective, _super);
    function InnerHtmlDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(InnerHtmlDirective.prototype, "innerHTML", {
        get: function () {
            return this.innerHTML_;
        },
        set: function (innerHTML) {
            if (this.innerHTML_ !== innerHTML) {
                this.innerHTML_ = innerHTML;
                var node = factory_1.getContext(this).node;
                node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
            }
        },
        enumerable: false,
        configurable: true
    });
    return InnerHtmlDirective;
}(directive_1.default));
exports.default = InnerHtmlDirective;
InnerHtmlDirective.meta = {
    selector: "[innerHTML]",
    inputs: ['innerHTML'],
};
