"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var factory_1 = require("../core/factory");
var structure_1 = tslib_1.__importDefault(require("../core/structure"));
var for_item_1 = tslib_1.__importDefault(require("./for.item"));
var ForStructure = /** @class */ (function (_super) {
    tslib_1.__extends(ForStructure, _super);
    function ForStructure() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.instances = [];
        return _this;
    }
    ForStructure.prototype.onInit = function () {
        var node = factory_1.getContext(this).node;
        var expression = node.getAttribute('*for');
        this.tokens = ForStructure.getForExpressionTokens(expression);
        var nodeRef = this.nodeRef = document.createComment("*for");
        node.parentNode.replaceChild(nodeRef, node);
        node.removeAttribute('*for');
    };
    ForStructure.prototype.onChanges = function () {
        var context = factory_1.getContext(this);
        var module = context.module;
        var node = context.node;
        var selector = context.selector;
        var parentInstance = context.parentInstance;
        var nodeRef = this.nodeRef;
        var tokens = this.tokens;
        var data = this.for || [];
        var isArray = Array.isArray(data);
        var items = isArray ? data : Object.keys(data);
        var total = items.length;
        var instances = this.instances;
        var previous = instances.length;
        for (var i = 0, len = Math.max(previous, total); i < len; i++) {
            if (i < total) {
                var key = isArray ? i : items[i];
                var value = isArray ? items[key] : data[key];
                if (i < previous) {
                    // update
                    var instance = instances[i];
                    instance[tokens.key] = key;
                    instance[tokens.value] = value;
                }
                else {
                    // create
                    var clonedNode = node.cloneNode(true);
                    nodeRef.parentNode.insertBefore(clonedNode, nodeRef);
                    var args = [tokens.key, key, tokens.value, value, i, total, parentInstance];
                    var instance = module.makeInstance(clonedNode, for_item_1.default, selector, parentInstance, args);
                    if (instance) {
                        module.compile(clonedNode, instance);
                        instances.push(instance);
                    }
                }
            }
            else {
                // remove
                var instance = instances[i];
                var node_1 = factory_1.getContext(instance).node;
                node_1.parentNode.removeChild(node_1);
                module.remove(node_1);
            }
        }
        instances.length = total;
    };
    ForStructure.mapExpression = function (key, expression) {
        var tokens = this.getForExpressionTokens(expression);
        return tokens.iterable;
    };
    ForStructure.getForExpressionTokens = function (expression) {
        if (expression === void 0) { expression = null; }
        if (expression == null) {
            throw new Error('invalid for');
        }
        if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
            throw new Error('invalid for');
        }
        var expressions = expression.split(';').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
        var forExpressions = expressions[0].split(' of ').map(function (x) { return x.trim(); });
        var value = forExpressions[0].replace(/\s*let\s*/, '');
        var iterable = forExpressions[1];
        var key = 'index';
        var keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
        if (keyValueMatches) {
            key = keyValueMatches[1];
            value = keyValueMatches[2];
        }
        if (expressions.length > 1) {
            var indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(function (x) { return x.trim(); });
            if (indexExpressions.length === 3) {
                key = indexExpressions[1];
            }
        }
        return { key: key, value: value, iterable: iterable };
    };
    ForStructure.meta = {
        selector: '[*for]',
        inputs: ['for'],
    };
    return ForStructure;
}(structure_1.default));
exports.default = ForStructure;
