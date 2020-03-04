"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var factory_1 = require("../core/factory");
var structure_1 = tslib_1.__importDefault(require("../core/structure"));
var IfStructure = /** @class */ (function (_super) {
    tslib_1.__extends(IfStructure, _super);
    function IfStructure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IfStructure.prototype.onInit = function () {
        var _a = factory_1.getContext(this), module = _a.module, node = _a.node;
        var ifbegin = this.ifbegin = document.createComment("*if begin");
        ifbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(ifbegin, node);
        var ifend = this.ifend = document.createComment("*if end");
        ifbegin.parentNode.insertBefore(ifend, ifbegin.nextSibling);
        var expression = node.getAttribute('*if');
        this.ifFunction = module.makeFunction(expression);
        var clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.element = clonedNode.cloneNode(true);
        // console.log('IfStructure.expression', expression);
    };
    IfStructure.prototype.onChanges = function (changes) {
        var module = factory_1.getContext(this).module;
        // console.log('IfStructure.onChanges', changes);
        var value = module.resolve(this.ifFunction, changes, this);
        var element = this.element;
        if (value) {
            if (!element.parentNode) {
                var ifend = this.ifend;
                ifend.parentNode.insertBefore(element, ifend);
                module.compile(element);
            }
        }
        else {
            if (element.parentNode) {
                module.remove(element, this);
                element.parentNode.removeChild(element);
                this.element = this.clonedNode.cloneNode(true);
            }
        }
    };
    IfStructure.meta = {
        selector: '[*if]',
    };
    return IfStructure;
}(structure_1.default));
exports.default = IfStructure;
