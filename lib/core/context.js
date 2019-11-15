// import { BehaviorSubject, Subject } from 'rxjs';
import Component from './component';

const RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onState', 'onDestroy', 'pushState', 'state$', 'unsubscribe$'];

export default class Context extends Component {

	constructor(instance, descriptors) {
		super();
		// const instancePrototypeDescriptors = {};
		const instancePrototypeDescriptors = Context.filterDescriptors(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance)), instance);
		// console.log('instancePrototypeDescriptors', instancePrototypeDescriptors);
		const instanceDescriptors = Context.filterDescriptors(Object.getOwnPropertyDescriptors(instance), instance);
		// console.log('instanceDescriptors', instanceDescriptors);
		/*
		const subjects = {
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
		};
		Object.defineProperties(this, Object.assign(instancePrototypeDescriptors, instanceDescriptors, subjects, descriptors || {}));
		*/
		// console.log(instancePrototypeDescriptors, instanceDescriptors);
		Object.defineProperties(this, Object.assign(instancePrototypeDescriptors, instanceDescriptors));
	}

	/*
	pushState() {
		this.state$.next(this);
	}
	*/

	static filterDescriptors(descriptors, instance) {
		const filteredDescriptors = {};
		Object.keys(descriptors).forEach(key => {
			if (RESERVED_PROPERTIES.indexOf(key) === -1) {
				// console.log('Context.filterDescriptors', key);
				const descriptor = descriptors[key];
				if (typeof descriptor.value == "function") {
					descriptor.value = (...args) => {
						instance[key].apply(instance, args);
					};
				}
				filteredDescriptors[key] = descriptor;
			}
		});
		// console.log(filteredDescriptors);
		return filteredDescriptors;;
	}

}
