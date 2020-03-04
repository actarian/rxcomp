import Directive from '../core/directive';
export default class ClassDirective extends Directive {
    class: {
        [key: string]: string;
    } | string | null;
    keys: string[];
    onInit(): void;
    onChanges(): void;
}
