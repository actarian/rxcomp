import Pipe from '../core/pipe';
// import Serializer, { encodeJson } from '../platform/common/serializer/serializer';

export default class JsonPipe extends Pipe {

	static transform(value: any): string | undefined {
		// !!!
		// return Serializer.encode(value, [encodeJson]);
		const pool: Map<any, boolean> = new Map();
		const json: string = JSON.stringify(value, function (key, value) {
			if (typeof value === 'object' && value != null) {
				if (pool.has(value)) {
					// Circular reference found, discard key
					return '#ref';
				}
				pool.set(value, true);
			}
			return value;
		}, 2);
		return json;
	}

}

JsonPipe.meta = {
	name: 'json',
};
