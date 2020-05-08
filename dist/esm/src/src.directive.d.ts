import Directive from '../core/directive';
export default class SrcDirective extends Directive {
    set src(src: string);
    get src(): string;
}
