
import Factory, { getContext } from './factory';

export default class Component extends Factory {
	pushChanges(): void {
		const { module, node, childInstances } = getContext(this);
		const instances = childInstances.slice();
		// try {
		let instance;
		for (let i: number = 0, len: number = instances.length; i < len; i++) {
			instance = instances[i];
			if (childInstances.indexOf(instance) !== -1) {
				instances[i].onParentDidChange(this);
			}
		}
		// this.changes$.next(this);
		module.parse(node, this);
		this.onView();
		// } catch (error) {
		//	console.log('Component.error', error, this);
		//	throw error;
		// }
	}
}
