"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var directive_1 = tslib_1.__importDefault(require("../core/directive"));
var factory_1 = require("../core/factory");
var EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];
var EventDirective = /** @class */ (function (_super) {
    tslib_1.__extends(EventDirective, _super);
    function EventDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.event = '';
        return _this;
    }
    EventDirective.prototype.onInit = function () {
        var _a = factory_1.getContext(this), module = _a.module, node = _a.node, parentInstance = _a.parentInstance, selector = _a.selector;
        var event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
        var event$ = rxjs_1.fromEvent(node, event).pipe(operators_1.shareReplay(1));
        var expression = node.getAttribute("(" + event + ")");
        if (expression) {
            var outputFunction_1 = module.makeFunction(expression, ['$event']);
            event$.pipe(operators_1.takeUntil(this.unsubscribe$)).subscribe(function (event) {
                module.resolve(outputFunction_1, parentInstance, event);
            });
        }
        else {
            parentInstance[event + "$"] = event$;
        }
        // console.log('EventDirective.onInit', 'selector', selector, 'event', event);
    };
    EventDirective.meta = {
        selector: "[(" + EVENTS.join(')],[(') + ")]",
    };
    return EventDirective;
}(directive_1.default));
exports.default = EventDirective;
