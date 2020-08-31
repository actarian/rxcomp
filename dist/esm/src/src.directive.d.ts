import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class SrcDirective extends Directive {
    set src(src: string);
    get src(): string;
    static meta: IFactoryMeta;
}
