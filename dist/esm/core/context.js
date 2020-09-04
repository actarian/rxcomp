// import { BehaviorSubject, Subject } from 'rxjs';
import Component from './component';
import { getContext } from './factory';
const RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
export default class Context extends Component {
    constructor(parentInstance, descriptors = {}) {
        super();
        descriptors = Context.mergeDescriptors(parentInstance, parentInstance, descriptors);
        descriptors = Context.mergeDescriptors(Object.getPrototypeOf(parentInstance), parentInstance, descriptors);
        Object.defineProperties(this, descriptors);
    }
    pushChanges() {
        const context = getContext(this);
        if (!context.keys) {
            context.keys = Object.keys(context.parentInstance).filter(key => RESERVED_PROPERTIES.indexOf(key) === -1);
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
    onParentDidChange(changes) {
        this.onChanges(changes);
        this.pushChanges();
    }
    static mergeDescriptors(source, instance, descriptors = {}) {
        const properties = Object.getOwnPropertyNames(source);
        while (properties.length) {
            const key = properties.shift();
            if (RESERVED_PROPERTIES.indexOf(key) === -1 && !descriptors.hasOwnProperty(key)) {
                const descriptor = Object.getOwnPropertyDescriptor(source, key);
                if (typeof descriptor.value == 'function') {
                    descriptor.value = (...args) => {
                        return instance[key].apply(instance, args);
                    };
                }
                descriptors[key] = descriptor;
            }
        }
        return descriptors;
    }
}
