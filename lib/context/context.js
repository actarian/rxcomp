import { BehaviorSubject, Subject } from "rxjs";

export default class Context {

	constructor(parent, descriptors) {
		const parentPrototypeDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(parent));
		delete parentPrototypeDescriptors.constructor;
		Object.keys(parentPrototypeDescriptors).forEach(key => {
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
			const descriptor = parentDescriptors[key];
			if (typeof descriptor.value == "function") {
				descriptor.value = (...args) => {
					parent[key].apply(parent, args);
				};
			}
		});
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
		/*
		this.pushState = () => {
			this.state$.next(this);
		};
		*/
	}

	pushState() {
		this.state$.next(this);
	}

}
