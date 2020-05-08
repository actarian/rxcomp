import Directive from '../core/directive';
export default class HrefDirective extends Directive {
    set href(href: string);
    get href(): string;
}
