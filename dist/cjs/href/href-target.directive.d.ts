import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class HrefTargetDirective extends Directive {
    set target(target: string);
    get target(): string;
    static meta: IFactoryMeta;
}
