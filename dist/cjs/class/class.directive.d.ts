import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class ClassDirective extends Directive {
    class: {
        [key: string]: string;
    } | string | null;
    keys: string[];
    onInit(): void;
    onChanges(): void;
    static meta: IFactoryMeta;
}
