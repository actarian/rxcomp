import ClassDirective from './class/class.directive';
import EventDirective from './event/event.directive';
import ForStructure from './for/for.structure';
import HrefDirective from './href/href.directive';
import IfStructure from './if/if.structure';
import InnerHtmlDirective from './inner-html/inner-html.directive';
import JsonPipe from './json/json.pipe';
import Module from './module/module';
import SrcDirective from './src/src.directive';
import StyleDirective from './style/style.directive';
const factories = [
    ClassDirective,
    EventDirective,
    ForStructure,
    HrefDirective,
    IfStructure,
    InnerHtmlDirective,
    SrcDirective,
    StyleDirective,
];
const pipes = [
    JsonPipe,
];
export default class CoreModule extends Module {
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
