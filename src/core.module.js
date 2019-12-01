import ClassDirective from './class/class.directive';
import EventDirective from './event/event.directive';
import ForStructure from './for/for.structure';
import IfStructure from './if/if.structure';
import InnerHtmlDirective from './inner-html/inner-html.directive';
import JsonPipe from './json/json.pipe';
import Module from './module/module';
import StyleDirective from './style/style.directive';

export default class CoreModule extends Module {}
const factories = [
	ClassDirective,
	EventDirective,
	ForStructure,
	IfStructure,
	InnerHtmlDirective,
	StyleDirective,
	JsonPipe,
];
const pipes = [
	JsonPipe,
];
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
