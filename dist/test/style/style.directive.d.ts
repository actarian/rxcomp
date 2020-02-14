import Directive from '../core/directive';
import { ExpressionFunction } from '../core/factory';
export default class StyleDirective extends Directive {
    styleFunction: ExpressionFunction;
    onInit(): void;
    onChanges(changes: any): void;
}
