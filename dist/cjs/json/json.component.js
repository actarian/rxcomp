"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var component_1 = tslib_1.__importDefault(require("../core/component"));
var JsonComponent = /** @class */ (function (_super) {
    tslib_1.__extends(JsonComponent, _super);
    function JsonComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.active = false;
        return _this;
    }
    JsonComponent.prototype.onToggle = function () {
        this.active = !this.active;
        this.pushChanges();
    };
    JsonComponent.meta = {
        selector: 'json-component',
        inputs: ['item'],
        template: "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ json </span>\n\t\t\t\t\t<span *if=\"active\">- json </span>\n\t\t\t\t\t<span [innerHTML]=\"item\"></span>\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\">\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item | json\"></span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>",
    };
    return JsonComponent;
}(component_1.default));
exports.default = JsonComponent;
