import Directive from '../core/directive';
export default class SrcDirective extends Directive {
    src?: string;
    onChanges(): void;
}
