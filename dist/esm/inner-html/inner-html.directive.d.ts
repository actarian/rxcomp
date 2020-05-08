import Directive from '../core/directive';
export default class InnerHtmlDirective extends Directive {
    set innerHTML(innerHTML: string);
    get innerHTML(): string;
}
