export interface IPipeMeta {
	name: string;
}

export default class Pipe {

	static transform(value: any): any {
		return value;
	}

	static meta: IPipeMeta;
}
