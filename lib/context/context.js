// import { BehaviorSubject, Subject } from 'rxjs';
import Component from '../component/component';

export default class Context extends Component {

	constructor(parent, descriptors) {
		super();
		const parentPrototypeDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(parent));
		delete parentPrototypeDescriptors.constructor;
		Object.keys(parentPrototypeDescriptors).forEach(key => {
			console.log('1', key);
			const descriptor = parentPrototypeDescriptors[key];
			if (typeof descriptor.value == "function") {
				descriptor.value = (...args) => {
					parent[key].apply(parent, args);
				};
			}
		});
		// console.log('parentPrototypeDescriptors', parentPrototypeDescriptors);
		const parentDescriptors = Object.getOwnPropertyDescriptors(parent);
		Object.keys(parentDescriptors).forEach(key => {
			switch (key) {
				case '$id':
				case 'state$':
				case 'unsubscribe$':
				case 'pushState':
					break;
				default:
					console.log('2', key);
					const descriptor = parentDescriptors[key];
					if (typeof descriptor.value == "function") {
						descriptor.value = (...args) => {
							parent[key].apply(parent, args);
						};
					}
			}
		});
		/*
		// console.log('parentDescriptors', parentDescriptors);
		Object.defineProperties(this, Object.assign(parentPrototypeDescriptors, parentDescriptors, {
			state$: {
				value: new BehaviorSubject(this),
				writable: false,
				enumerable: false,
			},
			unsubscribe$: {
				value: new Subject(),
				writable: false,
				enumerable: false,
			}
		}, descriptors));
		*/
	}

	/*
	pushState() {
		this.state$.next(this);
	}
	*/

}
