import Component from './component';
import Factory from './factory';
export default class Context extends Component {
    constructor(parentInstance: Factory, descriptors?: {
        [key: string]: PropertyDescriptor;
    });
    pushChanges(): void;
    static mergeDescriptors(source: Object, instance: Factory, descriptors?: {
        [key: string]: PropertyDescriptor;
    }): {
        [key: string]: PropertyDescriptor;
    };
}
