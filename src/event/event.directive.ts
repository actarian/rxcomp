import { fromEvent, Observable } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';
import Directive from '../core/directive';
import { getContext } from '../core/factory';
import { IFactoryMeta } from '../core/types';

const EVENTS = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

export default class EventDirective extends Directive {
	event: string = '';
	onInit() {
		const { module, node, parentInstance, selector } = getContext(this);
		// console.log('parentInstance', parentInstance);
		const event = this.event = selector.replace(/\[|\]|\(|\)/g, '');
		const event$: Observable<Event> = fromEvent<Event>(node, event).pipe(shareReplay(1));
		const expression = node.getAttribute(`(${event})`);
		if (expression) {
			const outputFunction = module.makeFunction(expression, ['$event']);
			event$.pipe(
				takeUntil(this.unsubscribe$)
			).subscribe(event => {
				module.resolve(outputFunction, parentInstance, event);
			});
		} else {
			parentInstance[`${event}$`] = event$;
		}
		// console.log('EventDirective.onInit', 'selector', selector, 'event', event);
	}
	static meta: IFactoryMeta = {
		selector: `[(${EVENTS.join(')],[(')})]`,
	};
}
