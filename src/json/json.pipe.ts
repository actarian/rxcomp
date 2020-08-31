import Pipe from '../core/pipe';
import { IPipeMeta } from '../core/types';
import Serializer, { encodeJsonWithOptions } from '../platform/common/serializer/serializer';

export default class JsonPipe extends Pipe {
	static transform(value: any): string | undefined {
		return Serializer.encode(value, [encodeJsonWithOptions('#ref', 2)]);
	}
	static meta: IPipeMeta = {
		name: 'json',
	};
}
