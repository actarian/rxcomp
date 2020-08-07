import Module from '../module/module';
import Platform from './platform';
export default class Browser extends Platform {
    /**
     * @param moduleFactory
     * @description This method returns a Browser compiled module
     */
    static bootstrap(moduleFactory?: typeof Module): Module;
}
