import { interval } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ClassDirective, Component, EventDirective, ForStructure, IfStructure, InnerHtmlDirective, JsonPipe, Module, StyleDirective } from '../../src/rxcomp';

// component
class AppComponent extends Component {
	onInit() {
		this.items = [1, 2, 3, 4];
		return interval(50).pipe(
			take(1000),
			takeUntil(this.unsubscribe$)
		).subscribe(items => {
			this.items = new Array(1 + Math.floor(Math.random() * 9)).fill(0).map((x, i) => i + 1);
			this.pushChanges();
		});
	}
}
AppComponent.meta = {
	selector: '[app-component]',
};

// pipe
class ExamplePipe {
	static transform(value) {
		return value * 2;
	}
}
ExamplePipe.meta = {
	name: 'example',
};

// module
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
		JsonPipe,
		ExamplePipe,
	],
	bootstrap: AppComponent,
});
