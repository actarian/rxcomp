import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Component, getContext } from '../../../src/rxcomp';
import StoreService from './store/store.service';
import ITodoItem from './todo-item/todo-item';

export default class AppComponent extends Component {

	input?: HTMLInputElement;
	items?: any[];
	store$?: BehaviorSubject<any>

	onInit() {
		// context
		const context = getContext(this);
		// input
		this.input = context.node.querySelector('.control--text') as HTMLInputElement;
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

	onInput($event: InputEvent) {
		// console.log('AppComponent.onInput', $event, this);
		this.pushChanges();
	}

	onAddItem($event: MouseEvent) {
		if (this.input!.value) {
			StoreService.add$({
				name: this.input!.value,
			}).subscribe((item: ITodoItem) => {
				// console.log('AppComponent.onAddItem', item);
				this.input!.value = '';
			});
		}
	}

	onToggleItem(item: ITodoItem) {
		StoreService.patch$({
			id: item.id,
			done: !item.done,
		}).subscribe((item: ITodoItem) => {
			// console.log('AppComponent.onToggleItem', item);
		});
	}

	onRemoveItem(item: ITodoItem) {
		StoreService.delete$(item).subscribe((item: ITodoItem) => {
			// console.log('AppComponent.onRemoveItem', item);
		});
	}

}

AppComponent.meta = {
	selector: '[app-component]',
};
