import Pipe from '../core/pipe';

export default class JsonPipe extends Pipe {

	// !!! todo: Remove circular structures when converting to JSON
	static transform(value: any): string {
		return JSON.stringify(value, null, '\t');
	}

}

JsonPipe.meta = {
	name: 'json',
};
