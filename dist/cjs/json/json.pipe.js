"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pipe_1 = tslib_1.__importDefault(require("../core/pipe"));
var JsonPipe = /** @class */ (function (_super) {
    tslib_1.__extends(JsonPipe, _super);
    function JsonPipe() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JsonPipe.transform = function (value) {
        var cache = new Map();
        var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value != null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return '#ref';
                }
                cache.set(value, true);
            }
            return value;
        }, 2);
        return json;
    };
    return JsonPipe;
}(pipe_1.default));
exports.default = JsonPipe;
JsonPipe.meta = {
    name: 'json',
};
