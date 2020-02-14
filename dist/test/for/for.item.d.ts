import Context from '../core/context';
import Factory from '../core/factory';
export default class ForItem extends Context {
    index: number;
    count: number;
    constructor(key: string, $key: number | string, value: string, $value: any, index: number, count: number, parentInstance: Factory);
    get first(): boolean;
    get last(): boolean;
    get even(): boolean;
    get odd(): boolean;
}
