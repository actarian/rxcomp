import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class InnerHtmlDirective extends Directive {
    set innerHTML(innerHTML: string);
    get innerHTML(): string;
    static meta: IFactoryMeta;
}
