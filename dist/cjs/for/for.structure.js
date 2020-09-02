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
        var _a = factory_1.getContext(this), module = _a.module, node = _a.node;
        var forbegin = document.createComment("*for begin");
        forbegin.rxcompId = node.rxcompId;
        node.parentNode.replaceChild(forbegin, node);
        var forend = this.forend = document.createComment("*for end");
        forbegin.parentNode.insertBefore(forend, forbegin.nextSibling);
        var expression = node.getAttribute('*for');
        node.removeAttribute('*for');
        var token = this.token = this.getExpressionToken(expression);
        this.forFunction = module.makeFunction(token.iterable);
    };
    ForStructure.prototype.onChanges = function (changes) {
        var context = factory_1.getContext(this);
        var module = context.module;
        var node = context.node;
        // resolve
        var token = this.token;
        var result = module.resolve(this.forFunction, changes, this) || [];
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
                    instance[token.key] = key;
                    instance[token.value] = value;
                    /*
                    if (!nextSibling) {
                        const context = getContext(instance);
                        const node = context.node;
                        this.forend.parentNode.insertBefore(node, this.forend);
                    } else {
                        nextSibling = nextSibling.nextSibling;
                    }
                    */
                }
                else {
                    // create
                    var clonedNode = node.cloneNode(true);
                    delete clonedNode.rxcompId;
                    this.forend.parentNode.insertBefore(clonedNode, this.forend);
                    // !!! todo: check context.parentInstance
                    var args = [token.key, key, token.value, value, i, total, context.parentInstance];
                    // console.log('ForStructure.makeInstance.ForItem');
                    var skipSubscription = true;
                    var instance = module.makeInstance(clonedNode, for_item_1.default, context.selector, context.parentInstance, args, undefined, skipSubscription);
                    // console.log('ForStructure.instance.created', instance);
                    if (instance) {
                        // const forItemContext = getContext(instance);
                        // console.log('ForStructure', clonedNode, forItemContext.instance.constructor.name);
                        // module.compile(clonedNode, forItemContext.instance);
                        // const instances: Factory[];
                        module.compile(clonedNode, instance);
                        module.makeInstanceSubscription(instance, context.parentInstance);
                        // console.log('ForStructure.instance.compiled', instances);
                        // nextSibling = clonedNode.nextSibling;
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
        // console.log('ForStructure', this.instances, token);
    };
    ForStructure.prototype.getExpressionToken = function (expression) {
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
    };
    return ForStructure;
}(structure_1.default));
exports.default = ForStructure;
