import Pipe from '../core/pipe';
export default class JsonPipe extends Pipe {
    static transform(value) {
        const cache = new Map();
        const json = JSON.stringify(value, function (key, value) {
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
    }
}
JsonPipe.meta = {
    name: 'json',
};
