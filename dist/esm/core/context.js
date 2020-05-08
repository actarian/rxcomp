// import { BehaviorSubject, Subject } from 'rxjs';
import Component from './component';
const RESERVED_PROPERTIES = ['constructor', 'rxcompId', 'onInit', 'onChanges', 'onDestroy', 'pushChanges', 'changes$', 'unsubscribe$'];
export default class Context extends Component {
    constructor(instance, descriptors = {}) {
        super();
        descriptors = Context.mergeDescriptors(instance, instance, descriptors);
        descriptors = Context.mergeDescriptors(Object.getPrototypeOf(instance), instance, descriptors);
        Object.defineProperties(this, descriptors);
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