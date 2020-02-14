import Directive from '../core/directive';
export default class HrefDirective extends Directive {
    href: string;
    onChanges(changes: any): void;
}
