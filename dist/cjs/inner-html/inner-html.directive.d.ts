import Directive from '../core/directive';
export default class InnerHtmlDirective extends Directive {
    innerHTML?: string;
    onChanges(): void;
}
