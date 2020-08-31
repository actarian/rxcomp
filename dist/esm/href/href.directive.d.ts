import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class HrefDirective extends Directive {
    set href(href: string);
    get href(): string;
    static meta: IFactoryMeta;
}
