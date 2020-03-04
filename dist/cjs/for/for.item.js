"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var context_1 = tslib_1.__importDefault(require("../core/context"));
var ForItem = /** @class */ (function (_super) {
    tslib_1.__extends(ForItem, _super);
    // !!! try with payload options { key, $key, value, $value, index, count } or use onInit()
    function ForItem(key, $key, value, $value, index, count, parentInstance) {
        var _this = 
        // console.log('ForItem', arguments);
        _super.call(this, parentInstance) || this;
        /*
        super(parentInstance, {
            [key]: {
                get: function() {
                    return this.$key;
                },
                set: function(key) {
                    this.$key = key;
                }
            },
            [value]: {
                get: function() {
                    return this.$value;
                },
                set: function(value) {
                    this.$value = value;
                }
            }
        });
        */
        _this[key] = $key;
        _this[value] = $value;
        _this.index = index;
        _this.count = count;
        return _this;
    }
    Object.defineProperty(ForItem.prototype, "first", {
        get: function () { return this.index === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForItem.prototype, "last", {
        get: function () { return this.index === this.count - 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForItem.prototype, "even", {
        get: function () { return this.index % 2 === 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForItem.prototype, "odd", {
        get: function () { return !this.even; },
        enumerable: true,
        configurable: true
    });
    return ForItem;
}(context_1.default));
exports.default = ForItem;
