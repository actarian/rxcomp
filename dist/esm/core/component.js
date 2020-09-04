import Factory, { getContext } from './factory';
export default class Component extends Factory {
    pushChanges() {
        const { module, node } = getContext(this);
        if (module.instances) {
            this.changes$.next(this);
            module.parse(node, this);
            this.onView();
        }
    }
}
