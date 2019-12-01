import Pipe from "../core/pipe";

export default class JsonPipe extends Pipe {

	static transform(value) {
		return JSON.stringify(value);
	}

}

JsonPipe.meta = {
	name: 'json',
};
