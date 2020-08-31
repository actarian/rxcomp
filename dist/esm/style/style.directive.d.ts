import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class StyleDirective extends Directive {
    style?: {
        [key: string]: string;
    } | null;
    previousStyle?: {
        [key: string]: string;
    } | null;
    onChanges(): void;
    static meta: IFactoryMeta;
}
