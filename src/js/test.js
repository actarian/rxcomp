import { ClassDirective, Component, EventDirective, ForStructure, IfStructure, InnerHtmlDirective, JsonPipe, Module, StyleDirective } from '../../lib/rxcomp';
import DatePipe from './date/date.pipe';

class TestComponent extends Component {

	onInit() {
		this.items = [1, 2];
		this.object = { a: 1, b: 2 };
		this.date = new Date();
	}

}

TestComponent.meta = {
	selector: '[test-component]',
};

Module.use$({
	debug: true,
	factories: [
		ClassDirective,
		EventDirective,
		ForStructure,
		IfStructure,
		InnerHtmlDirective,
		StyleDirective,
	],
	pipes: [
		DatePipe,
		JsonPipe,
	],
	bootstrap: TestComponent,
}).subscribe(createdInstances => {
	// console.log('createdInstances', createdInstances);
});
