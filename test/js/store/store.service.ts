import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import LocalStorageService from '../local-storage/local-storage.service';
import ITodoItem from '../todo-item/todo-item';

export default class StoreService {

	static store$: BehaviorSubject<any>;

	static set(items: ITodoItem[]) {
		LocalStorageService.set('items', items);
		return this.get$().next(items);
	}

	static get$(): BehaviorSubject<ITodoItem[]> {
		if (this.store$) {
			return this.store$;
		}
		let items: ITodoItem[] = LocalStorageService.get('items');
		if (!items) {
			items = [
				{ id: 5, name: 'Cookies', date: new Date(Date.now()) },
				{ id: 4, name: 'Pizza', date: new Date(2019, 4, 4, 12) },
				{ id: 3, name: 'Pasta', date: new Date(2019, 3, 22, 12) },
				{ id: 2, name: 'Bread', date: new Date(2019, 0, 6, 12) },
				{ id: 1, name: 'Ham', date: new Date(2018, 11, 30, 12) },
			];
			LocalStorageService.set('items', items);
		}
		this.store$ = new BehaviorSubject<ITodoItem[]>(items);
		return this.store$.pipe(
			delay(1) // simulate http
		) as BehaviorSubject<ITodoItem[]>;
	}

	static add$(patch: ITodoItem): Observable<ITodoItem> {
		const item = Object.assign({
			id: Date.now(),
			date: new Date(Date.now())
		}, patch);
		const items = this.store$.getValue();
		items.unshift(item);
		this.set(items);
		return of(item).pipe(
			delay(1) // simulate http
		);
	}

	static patch$(patch: ITodoItem): Observable<ITodoItem> {
		const items = this.store$.getValue();
		const item = items.find((x: ITodoItem) => x.id === patch.id);
		if (item) {
			Object.assign(item, patch);
			this.set(items);
		}
		return of(item).pipe(
			delay(1) // simulate http
		);
	}

	static delete$(item: ITodoItem): Observable<ITodoItem> {
		const items = this.store$.getValue();
		const index = items.indexOf(item);
		if (index !== -1) {
			items.splice(index, 1);
			this.set(items);
		}
		return of(item).pipe(
			delay(1) // simulate http
		);
	}

}
