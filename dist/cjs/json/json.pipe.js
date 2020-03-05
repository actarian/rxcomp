"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pipe_1 = tslib_1.__importDefault(require("../core/pipe"));
var JsonPipe = /** @class */ (function (_super) {
    tslib_1.__extends(JsonPipe, _super);
    function JsonPipe() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // !!! todo: Remove circular structures when converting to JSON
    JsonPipe.transform = function (value) {
        return JSON.stringify(value, null, '\t');
    };
    return JsonPipe;
}(pipe_1.default));
exports.default = JsonPipe;
JsonPipe.meta = {
    name: 'json',
};
