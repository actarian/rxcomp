import Pipe from '../core/pipe';
import Serializer, { encodeJsonWithOptions } from '../platform/common/serializer/serializer';

export default class JsonPipe extends Pipe {

	static transform(value: any): string | undefined {
		return Serializer.encode(value, [encodeJsonWithOptions(2, '#ref')]);
	}

}

JsonPipe.meta = {
	name: 'json',
};
