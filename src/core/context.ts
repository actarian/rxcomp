// import { BehaviorSubject, Subject } from 'rxjs';
import Component from './component';
import Factory from './factory';

const RESERVED_PROPERTIES = ['constructor', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];

export default class Context extends Component {
	parentInstance: Factory;
	constructor(parentInstance: Factory, descriptors: { [key: string]: PropertyDescriptor } = {}) {
		super();
		this.parentInstance = parentInstance;
		/*
		descriptors = Context.mergeDescriptors(parentInstance, parentInstance, descriptors);
		descriptors = Context.mergeDescriptors(Object.getPrototypeOf(parentInstance), parentInstance, descriptors);
		Object.defineProperties(this, descriptors);
		*/
	}
	/*
	pushChanges(): void {
		const context = getContext(this);
		if (!context.keys) {
			context.keys = [];
			// context.keys = Object.keys(context.parentInstance).filter(key => RESERVED_PROPERTIES.indexOf(key) === -1);
			for (let i:number = 0, keys = Object.keys(context.parentInstance), len = keys.length; i < len; i++) {
				const key = keys[i];
				if (RESERVED_PROPERTIES.indexOf(key) === -1) {
					context.keys.push(key);
				}
			}
			// console.log(context.keys.join(','));
		}
		if (context.module.instances) {
			context.keys.forEach(key => {
				// console.log('Context', key, context.parentInstance);
				this[key] = context.parentInstance[key];
			});
		}
		super.pushChanges();
	}
	*/
	onParentDidChange(changes: Factory | Window): void {
		this.onChanges(changes);
		this.pushChanges();
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
