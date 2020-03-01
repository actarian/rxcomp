// import { BehaviorSubject, Subject } from 'rxjs';
import Component from './component';
import Factory from './factory';

const RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];

export default class Context extends Component {

	constructor(instance: Factory, descriptors: { [key: string]: PropertyDescriptor } = {}) {
		super();
		descriptors = Context.mergeDescriptors(instance, instance, descriptors);
		descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
		/*
		const subjects = {
			changes$: {
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
		*/
		Object.defineProperties(this, descriptors);
	}

	static mergeDescriptors(source: Object, instance: Factory, descriptors: { [key: string]: PropertyDescriptor } = {}): { [key: string]: PropertyDescriptor } {
		const properties: string[] = Object.getOwnPropertyNames(source);
		while (properties.length) {
			const key: string = properties.shift() as string;
			if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
				const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(source, key) as PropertyDescriptor;
				if (typeof descriptor.value == 'function') {
					descriptor.value = (...args: any[]) => {
						return instance[key].apply(instance, args);
					};
				}
				descriptors[key] = descriptor;
			}
		}
		return descriptors;
	}

}
