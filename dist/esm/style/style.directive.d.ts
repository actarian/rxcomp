import Directive from '../core/directive';
export default class StyleDirective extends Directive {
    style?: {
        [key: string]: string;
    } | null;
    previousStyle?: {
        [key: string]: string;
    } | null;
    onChanges(): void;
}
