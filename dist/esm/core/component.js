import Factory, { getContext } from './factory';
export default class Component extends Factory {
    pushChanges() {
        const { module, node, childInstances } = getContext(this);
        const instances = childInstances.slice();
        // try {
        let instance;
        for (let i = 0, len = instances.length; i < len; i++) {
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
