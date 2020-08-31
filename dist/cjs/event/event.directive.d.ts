import Directive from '../core/directive';
import { IFactoryMeta } from '../core/types';
export default class EventDirective extends Directive {
    event: string;
    onInit(): void;
    static meta: IFactoryMeta;
}
