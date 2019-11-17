export default class JsonPipe {

	static transform(value) {
		return JSON.stringify(value);
	}

}

JsonPipe.meta = {
	name: 'json',
};
