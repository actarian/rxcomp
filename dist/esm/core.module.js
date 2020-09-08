import { takeUntil } from 'rxjs/operators';
import ClassDirective from './class/class.directive';
import { errors$ } from './error/error';
import EventDirective from './event/event.directive';
import ForStructure from './for/for.structure';
import HrefTargetDirective from './href/href-target.directive';
import HrefDirective from './href/href.directive';
import IfStructure from './if/if.structure';
import InnerHtmlDirective from './inner-html/inner-html.directive';
import JsonComponent from './json/json.component';
import JsonPipe from './json/json.pipe';
import Module from './module/module';
import SrcDirective from './src/src.directive';
import StyleDirective from './style/style.directive';
const factories = [
    ClassDirective,
    EventDirective,
    ForStructure,
    HrefDirective,
    HrefTargetDirective,
    IfStructure,
    InnerHtmlDirective,
    JsonComponent,
    SrcDirective,
    StyleDirective,
];
const pipes = [
    JsonPipe,
];
export default class CoreModule extends Module {
    constructor() {
        super();
        // console.log('CoreModule');
        errors$.pipe(takeUntil(this.unsubscribe$)).subscribe();
    }
}
CoreModule.meta = {
    declarations: [
        ...factories,
        ...pipes,
    ],
    exports: [
        ...factories,
        ...pipes,
    ]
};
