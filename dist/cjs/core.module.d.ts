import Factory from './core/factory';
import Pipe from './core/pipe';
import Module from './module/module';
export default class CoreModule extends Module {
    constructor();
    static meta: {
        declarations: (typeof Factory | typeof Pipe)[];
        exports: (typeof Factory | typeof Pipe)[];
    };
}
