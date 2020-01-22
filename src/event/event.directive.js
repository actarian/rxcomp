import { fromEvent } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';
import Directive from '../core/directive';
import { getContext } from '../module/module';

const EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

export default class EventDirective extends Directive {

	onInit() {
		const { module, node, parentInstance, selector } = getContext(this);
		const event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
		const event$ = this.event$ = fromEvent(node, event).pipe(shareReplay(1));
		const expression = node.getAttribute(`(${event})`);
		if (expression) {
			const outputFunction = module.makeFunction(expression, ['$event']);
			event$.pipe(
				takeUntil(this.unsubscribe$)
			).subscribe(event => {
				// console.log(parentInstance);
				module.resolve(outputFunction, parentInstance, event);
			});
		} else {
			parentInstance[`${event}$`] = event$;
		}
		// console.log('EventDirective.onInit', 'selector', selector, 'event', event);
	}

}

EventDirective.meta = {
	selector: `[(${EVENTS.join(')],[(')})]`,
};
