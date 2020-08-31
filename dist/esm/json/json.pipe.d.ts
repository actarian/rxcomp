import Pipe from '../core/pipe';
import { IPipeMeta } from '../core/types';
export default class JsonPipe extends Pipe {
    static transform(value: any): string | undefined;
    static meta: IPipeMeta;
}
