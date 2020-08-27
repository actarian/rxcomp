import Pipe from '../core/pipe';
import Serializer, { encodeJsonWithOptions } from '../platform/common/serializer/serializer';
export default class JsonPipe extends Pipe {
    static transform(value) {
        return Serializer.encode(value, [encodeJsonWithOptions('#ref', 2)]);
    }
}
JsonPipe.meta = {
    name: 'json',
};
