import { takeUntil } from 'rxjs/operators';
import { Component, Module } from '../../src/rxcomp';
import StoreService from './store/store.service';

export default class AppComponent extends Component {

	onInit() {
		// context
		const context = Module.getContext(this);
		// input
		this.input = context.node.querySelector('.control--text');
		// items
		this.items = [];
		// store service
		this.store$ = StoreService.get$();
		this.store$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(items => {
			this.items = items;
			// onpush change detection strategy
			this.pushChanges();
		});
	}

	onView() {
		const context = Module.getContext(this);
		// console.log('AppComponent.onView', context.node);
	}

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
