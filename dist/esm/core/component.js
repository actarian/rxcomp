import Factory, { getContext } from './factory';
export default class Component extends Factory {
    pushChanges() {
        const { module, node, childInstances } = getContext(this);
        if (module.instances) {
            for (let i = 0, len = childInstances.length; i < len; i++) {
                childInstances[i].onParentDidChange(this);
            }
            // this.changes$.next(this);
            module.parse(node, this);
            this.onView();
        }
    }
}
