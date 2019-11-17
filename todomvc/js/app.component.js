/*
import { fromEvent } from 'rxjs';
import { auditTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
*/
import { takeUntil } from 'rxjs/operators';
import { Component, Module } from '../../src/rxcomp';
import StoreService from './store/store.service';

export default class AppComponent extends Component {

	onInit() {
		const context = Module.getContext(this);
		this.input = context.node.querySelector('.control--text');
		this.items = [];
		this.store$ = StoreService.get$();
		this.store$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(items => {
			// console.log('AppComponent.store$', items);
			this.items = items;
			this.pushChanges();
		});
		/*
		this.input$().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(input => {
			// console.log(input);
			this.input = input;
		});
		*/
		// console.log('AppComponent', Object.keys(this).join(','));
	}

	onView() {
		const context = Module.getContext(this);
		// console.log('AppComponent.onView', context.node);
	}

	/*
	input$() {
		const context = Module.getContext(this);
		const input = context.node.querySelector('.control--text');
		return fromEvent(input, 'input').pipe(
			map(event => input.value),
			auditTime(200),
			distinctUntilChanged()
		);
	}
	*/

	onInput($event) {
		// console.log('AppComponent.onInput', $event, this);
		this.pushChanges();
	}

	onAddItem($event) {
		if (this.input.value) {
			StoreService.add$({
				name: this.input.value,
			}).subscribe(item => {
				// console.log('AppComponent.onAddItem', item);
				this.input.value = null;
			});
		}
	}

	onToggleItem(item) {
		StoreService.patch$({
			id: item.id,
			done: !item.done,
		}).subscribe(item => {
			// console.log('AppComponent.onToggleItem', item);
		});
	}

	onRemoveItem(item) {
		StoreService.delete$(item).subscribe(item => {
			// console.log('AppComponent.onRemoveItem', item);
		});
	}

}

AppComponent.meta = {
	selector: '[app-component]',
};
