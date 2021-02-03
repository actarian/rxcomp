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
        var node = factory_1.getContext(this).node;
        var nodeRef = this.nodeRef = document.createComment("*if");
        node.parentNode.replaceChild(nodeRef, node);
        var clonedNode = node.cloneNode(true);
        clonedNode.removeAttribute('*if');
        this.clonedNode = clonedNode;
        this.element = clonedNode.cloneNode(true);
    };
    IfStructure.prototype.onChanges = function () {
        var _a = factory_1.getContext(this), module = _a.module, parentInstance = _a.parentInstance;
        var element = this.element;
        // console.log('IfStructure.onChanges.if', this.if);
        if (Boolean(this.if)) { // !!! keep == loose equality
            if (!element.parentNode) {
                var nodeRef = this.nodeRef;
                nodeRef.parentNode.insertBefore(element, nodeRef);
                module.compile(element, parentInstance);
                // console.log('IfStructure.onChanges.add', element);
            }
        }
        else {
            if (element.parentNode) {
                module.remove(element, this);
                element.parentNode.removeChild(element);
                this.element = this.clonedNode.cloneNode(true);
                // console.log('IfStructure.onChanges.remove', element);
            }
        }
    };
    IfStructure.meta = {
        selector: '[*if]',
        inputs: ['if'],
    };
    return IfStructure;
}(structure_1.default));
exports.default = IfStructure;
