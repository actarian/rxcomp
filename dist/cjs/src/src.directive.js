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
    SrcDirective.prototype.onChanges = function () {
        var node = factory_1.getContext(this).node;
        if (this.src) {
            node.setAttribute('src', this.src);
        }
        else {
            node.removeAttribute('src');
        }
    };
    return SrcDirective;
}(directive_1.default));
exports.default = SrcDirective;
SrcDirective.meta = {
    selector: '[[src]]',
    inputs: ['src'],
};
