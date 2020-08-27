"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pipe_1 = tslib_1.__importDefault(require("../core/pipe"));
var serializer_1 = tslib_1.__importStar(require("../platform/common/serializer/serializer"));
var JsonPipe = /** @class */ (function (_super) {
    tslib_1.__extends(JsonPipe, _super);
    function JsonPipe() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JsonPipe.transform = function (value) {
        return serializer_1.default.encode(value, [serializer_1.encodeJsonWithOptions(2, '#ref')]);
    };
    return JsonPipe;
}(pipe_1.default));
exports.default = JsonPipe;
JsonPipe.meta = {
    name: 'json',
};
