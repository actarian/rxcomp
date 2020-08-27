import Pipe from '../core/pipe';
export default class JsonPipe extends Pipe {
    static transform(value: any): string | undefined;
}
