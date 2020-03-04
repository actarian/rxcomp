import { IPipeMeta } from "./types";
export default class Pipe {
    static transform(value: any): any;
    static meta: IPipeMeta;
}
