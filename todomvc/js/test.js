import { ClassDirective, Component, EventDirective, ForStructure, IfStructure, InnerHtmlDirective, JsonPipe, Module, StyleDirective } from '../../src/rxcomp';
import DatePipe from './date/date.pipe';

class TestComponent extends Component {

	onInit() {
		// console.log('TestComponent.onInit');
		this.items = [1, 2];
		this.object = { a: 1, b: 2 };
		this.date = new Date();
	}

}

TestComponent.meta = {
	selector: '[test-component]',
};

class Test2Component extends Component {

	onInit() {
		// console.log('TestComponent.onInit');
		this.items = [2, 3];
		this.object = { a: 2, b: 3 };
		this.date = new Date();
	}

}

Test2Component.meta = {
	selector: '[test-component]',
};

const module = Module.use({
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
});

function init() {
	module.destroy();

	Module.use({
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
		bootstrap: Test2Component,
	});
}

setTimeout(() => {
	init();
}, 5000);
