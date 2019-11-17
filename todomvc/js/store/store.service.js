import { BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import LocalStorageService from '../local-storage/local-storage.service';

export default class StoreService {

	static set(items) {
		LocalStorageService.set('items', items);
		return this.get$().next(items);
	}

	static get$() {
		if (this.store$) {
			return this.store$;
		}
		let items = LocalStorageService.get('items');
		if (!items) {
			items = [
				{ id: 3, name: 'cookies', date: new Date(Date.now()) },
				{ id: 2, name: 'pizza', date: new Date(2019, 3, 22, 12) },
				{ id: 1, name: 'bread', date: new Date(2019, 0, 6, 12) },
			];
			LocalStorageService.set('items', items);
		}
		this.store$ = new BehaviorSubject(items);
		return this.store$.pipe(
			delay(1) // simulate http
		);
	}

	static add$(patch) {
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

	static patch$(patch) {
		const items = this.store$.getValue();
		const item = items.find(x => x.id === patch.id);
		if (item) {
			Object.assign(item, patch);
			this.set(items);
		}
		return of(item).pipe(
			delay(1) // simulate http
		);
	}

	static delete$(item) {
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
