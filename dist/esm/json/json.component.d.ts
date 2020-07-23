import Component from '../core/component';
import { IFactoryMeta } from '../core/types';
export default class JsonComponent extends Component {
    active: boolean;
    onToggle(): void;
    static meta: IFactoryMeta;
}
