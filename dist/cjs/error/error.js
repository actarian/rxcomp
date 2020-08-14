"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors$ = exports.nextError$ = exports.ErrorInterceptors = exports.DefaultErrorHandler = exports.ErrorInterceptorHandler = exports.ExpressionError = exports.ModuleError = void 0;
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var factory_1 = require("../core/factory");
var ModuleError = /** @class */ (function (_super) {
    tslib_1.__extends(ModuleError, _super);
    function ModuleError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ModuleError;
}(Error));
exports.ModuleError = ModuleError;
var ExpressionError = /** @class */ (function (_super) {
    tslib_1.__extends(ExpressionError, _super);
    function ExpressionError(error, module, instance, expression, params) {
        var _this = this;
        var message = "ExpressionError in " + instance.constructor.name + " \"" + expression + "\"\n\t\t" + error.message;
        _this = _super.call(this, message) || this;
        _this.name = error.name;
        // this.stack = error.stack;
        _this.module = module;
        _this.instance = instance;
        _this.expression = expression;
        _this.params = params;
        var node = factory_1.getContext(instance).node;
        _this.template = node.outerHTML;
        return _this;
    }
    return ExpressionError;
}(Error));
exports.ExpressionError = ExpressionError;
var ErrorInterceptorHandler = /** @class */ (function () {
    function ErrorInterceptorHandler(next, interceptor) {
        this.next = next;
        this.interceptor = interceptor;
    }
    ErrorInterceptorHandler.prototype.handle = function (error) {
        return this.interceptor.intercept(error, this.next);
    };
    return ErrorInterceptorHandler;
}());
exports.ErrorInterceptorHandler = ErrorInterceptorHandler;
/*
export class NoopErrorInterceptor implements IErrorInterceptor {
    intercept(error: Error, next: ErrorHandler): Observable<Error> {
        return of(error);
    }
}

const noopInterceptor = new NoopErrorInterceptor();
*/
var DefaultErrorHandler = /** @class */ (function () {
    function DefaultErrorHandler() {
    }
    DefaultErrorHandler.prototype.handle = function (error) {
        /*
        if (error) {
            console.error(error);
        }
        */
        return rxjs_1.of(error);
    };
    return DefaultErrorHandler;
}());
exports.DefaultErrorHandler = DefaultErrorHandler;
exports.ErrorInterceptors = [];
exports.nextError$ = new rxjs_1.ReplaySubject(1);
exports.errors$ = exports.nextError$.pipe(
/*
switchMap(error => {
    const chain = ErrorInterceptors.reduceRight((next: ErrorHandler, interceptor: IErrorInterceptor) => {
        return new ErrorInterceptorHandler(next, interceptor);
    }, new NoopErrorInterceptor());
    return chain.handle(error);
}),
*/
// switchMap(error => merge(ErrorInterceptors.map(x => x.intercept(error, next)))),
operators_1.switchMap(function (error) {
    var chain = exports.ErrorInterceptors.reduceRight(function (next, interceptor) {
        return new ErrorInterceptorHandler(next, interceptor);
    }, new DefaultErrorHandler());
    return chain.handle(error);
}), operators_1.tap(function (error) {
    if (error) {
        console.error(error);
    }
}));
