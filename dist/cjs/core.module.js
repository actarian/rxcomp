"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var operators_1 = require("rxjs/operators");
var class_directive_1 = tslib_1.__importDefault(require("./class/class.directive"));
var error_1 = require("./error/error");
var event_directive_1 = tslib_1.__importDefault(require("./event/event.directive"));
var for_structure_1 = tslib_1.__importDefault(require("./for/for.structure"));
var href_directive_1 = tslib_1.__importDefault(require("./href/href.directive"));
var if_structure_1 = tslib_1.__importDefault(require("./if/if.structure"));
var inner_html_directive_1 = tslib_1.__importDefault(require("./inner-html/inner-html.directive"));
var json_component_1 = tslib_1.__importDefault(require("./json/json.component"));
var json_pipe_1 = tslib_1.__importDefault(require("./json/json.pipe"));
var module_1 = tslib_1.__importDefault(require("./module/module"));
var src_directive_1 = tslib_1.__importDefault(require("./src/src.directive"));
var style_directive_1 = tslib_1.__importDefault(require("./style/style.directive"));
var factories = [
    class_directive_1.default,
    event_directive_1.default,
    for_structure_1.default,
    href_directive_1.default,
    if_structure_1.default,
    inner_html_directive_1.default,
    json_component_1.default,
    src_directive_1.default,
    style_directive_1.default,
];
var pipes = [
    json_pipe_1.default,
];
var CoreModule = /** @class */ (function (_super) {
    tslib_1.__extends(CoreModule, _super);
    function CoreModule() {
        var _this = _super.call(this) || this;
        // console.log('CoreModule');
        error_1.errors$.pipe(operators_1.takeUntil(_this.unsubscribe$)).subscribe();
        return _this;
    }
    CoreModule.meta = {
        declarations: tslib_1.__spread(factories, pipes),
        exports: tslib_1.__spread(factories, pipes)
    };
    return CoreModule;
}(module_1.default));
exports.default = CoreModule;
