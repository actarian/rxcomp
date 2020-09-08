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
        var forbegin = this.forbegin = document.createComment("*for begin");
        forbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(forbegin, node);
        var forend = this.forend = document.createComment("*for end");
        forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
        node.removeAttribute('*for');
    };
    ForStructure.prototype.onChanges = function () {
        var context = factory_1.getContext(this);
        var module = context.module;
        var node = context.node;
        var tokens = this.tokens;
        var result = this.for || [];
        var isArray = Array.isArray(result);
        var array = isArray ? result : Object.keys(result);
        var total = array.length;
        var previous = this.instances.length;
        for (var i = 0; i < Math.max(previous, total); i++) {
            if (i < total) {
                var key = isArray ? i : array[i];
                var value = isArray ? array[key] : result[key];
                if (i < previous) {
                    // update
                    var instance = this.instances[i];
                    instance[tokens.key] = key;
                    instance[tokens.value] = value;
                }
                else {
                    // create
                    var clonedNode = node.cloneNode(true);
                    delete clonedNode.rxcompId;
                    this.forend.parentNode.insertBefore(clonedNode, this.forend);
                    var args = [tokens.key, key, tokens.value, value, i, total, context.parentInstance];
                    var skipSubscription = true;
                    var instance = module.makeInstance(clonedNode, for_item_1.default, context.selector, context.parentInstance, args, undefined, skipSubscription);
                    if (instance) {
                        module.compile(clonedNode, instance);
                        module.makeInstanceSubscription(instance, context.parentInstance);
                        this.instances.push(instance);
                    }
                }
            }
            else {
                // remove
                var instance = this.instances[i];
                var node_1 = factory_1.getContext(instance).node;
                node_1.parentNode.removeChild(node_1);
                module.remove(node_1);
            }
        }
        this.instances.length = array.length;
    };
    ForStructure.getInputsTokens = function (instance, node, module) {
        var inputs = {};
        var expression = node.getAttribute('*for');
        if (expression) {
            var tokens = ForStructure.getForExpressionTokens(expression);
            instance.tokens = tokens;
            inputs.for = tokens.iterable;
        }
        return inputs;
    };
    ForStructure.getForExpressionTokens = function (expression) {
        if (expression === null) {
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
