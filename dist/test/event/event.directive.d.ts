import { Observable } from 'rxjs';
import Directive from '../core/directive';
export default class EventDirective extends Directive {
    event: string;
    event$: Observable<Event>;
    onInit(): void;
}
