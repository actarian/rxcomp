"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var StyleDirective = /** @class */ (function (_super) {
    tslib_1.__extends(StyleDirective, _super);
    function StyleDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StyleDirective.prototype.onChanges = function () {
        var node = factory_1.getContext(this).node;
        var style = this.style;
        var previousStyle = this.previousStyle;
        if (previousStyle) {
            for (var key in previousStyle) {
                if (!style || !style[key]) {
                    var splitted = key.split('.');
                    var propertyName = splitted.shift();
                    node.style.removeProperty(propertyName);
                }
            }
        }
        if (style) {
            for (var key in style) {
                if (!previousStyle || previousStyle[key] !== style[key]) {
                    var splitted = key.split('.');
                    var propertyName = splitted.shift();
                    var value = style[key] + (splitted.length ? splitted[0] : '');
                    // console.log(propertyName, value, style, key, style[key]);
                    node.style.setProperty(propertyName, value);
                }
            }
        }
        this.previousStyle = style;
        // console.log('StyleDirective.onChanges', style);
    };
    return StyleDirective;
}(directive_1.default));
exports.default = StyleDirective;
StyleDirective.meta = {
    selector: "[[style]]",
    inputs: ['style']
};
