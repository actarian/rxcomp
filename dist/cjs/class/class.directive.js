"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import Factory, { ExpressionFunction } from '../core/factory';
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var ClassDirective = /** @class */ (function (_super) {
    tslib_1.__extends(ClassDirective, _super);
    function ClassDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.class = '';
        _this.keys = [];
        return _this;
    }
    ClassDirective.prototype.onInit = function () {
        var _this = this;
        var node = factory_1.getContext(this).node;
        Array.prototype.slice.call(node.classList).forEach(function (x) { return _this.keys.push(x); });
    };
    ClassDirective.prototype.onChanges = function () {
        var node = factory_1.getContext(this).node;
        var keys = [];
        var object = this.class;
        if (typeof object === 'object') {
            for (var key in object) {
                if (object[key]) {
                    keys.push(key);
                }
            }
        }
        else if (typeof object === 'string') {
            keys = object.split(/\s+/);
        }
        keys = keys.concat(this.keys);
        // console.log(keys);
        node.setAttribute('class', keys.join(' '));
        // console.log('ClassDirective.onChanges', keys);
    };
    return ClassDirective;
}(directive_1.default));
exports.default = ClassDirective;
ClassDirective.meta = {
    selector: "[[class]]",
    inputs: ['class']
};
