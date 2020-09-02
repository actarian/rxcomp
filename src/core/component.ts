
import Context from './context';
import Factory, { getContext } from './factory';

export default class Component extends Factory {

	pushChanges(): void {
		const { module, node } = getContext(this);
		if (module.instances) {
			// console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
			this.changes$.next(this);
			// console.log('Module.parse', instance.constructor.name);
			// parse component text nodes
			if (this instanceof Context) {
				const instances: Factory[] = module.getChildInstances(node);
				console.log(node, instances);
			}
			module.parse(node, this);
			// calling onView event
			this.onView();
		}
	}

}
