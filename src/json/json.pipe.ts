import Pipe from '../core/pipe';

export default class JsonPipe extends Pipe {

	static transform(value: any): string {
		const cache: Map<any, boolean> = new Map();
		const json: string = JSON.stringify(value, function (key, value) {
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

