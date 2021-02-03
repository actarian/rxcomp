import Component from './component';
import Factory from './factory';
export default class Context extends Component {
    parentInstance: Factory;
    constructor(parentInstance: Factory);
    onParentDidChange(changes: Factory | Window): void;
}
