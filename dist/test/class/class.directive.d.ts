import Directive from '../core/directive';
import { ExpressionFunction } from '../core/factory';
export default class ClassDirective extends Directive {
    classFunction: ExpressionFunction;
    onInit(): void;
    onChanges(changes: any): void;
}
