import Factory, { getContext } from './factory';
export default class Component extends Factory {
    pushChanges() {
        const { module, node } = getContext(this);
        // console.log(new Error(`pushChanges ${instance.constructor.name}`).stack);
        this.changes$.next(this);
        // console.log('Module.parse', instance.constructor.name);
        // parse component text nodes
        module.parse(node, this);
        // calling onView event
        this.onView();
    }
}
