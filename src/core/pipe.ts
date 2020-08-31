import { IPipeMeta } from "./types";

export default class Pipe {
	static transform(value: any): any {
		return value;
	}
	static meta: IPipeMeta;
}
