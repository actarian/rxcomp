import { interval } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Browser, Component, CoreModule, Module, Pipe } from '../../src/rxcomp';

// component
class RootComponent extends Component {
	onInit() {
		this.flag = false;
		this.nested = [
			{ items: [1, 2, 3, 4] },
			{ items: [1, 2, 3, 4] },
			{ items: [1, 2, 3, 4] }
		];
		this.items = [1, 2, 3, 4];
		this.object = { a: 1, b: { c: 2 } };
		if (true) {
			interval(1000).pipe(
				take(1000),
				takeUntil(this.unsubscribe$)
			).subscribe(items => {
				this.flag = !this.flag;
				this.pushChanges();
			});
		}
		/*
		interval(50).pipe(
			take(1000),
			takeUntil(this.unsubscribe$)
		).subscribe(items => {
			this.items = new Array(1 + Math.floor(Math.random() * 9)).fill(0).map((x, i) => i + 1);
			this.pushChanges();
		});
		*/
	}

	getColor(index) {
		return ['red', 'green', 'blue'][index % 3];
	}
}
RootComponent.meta = {
	selector: '[root-component]',
};

// pipe
class ExamplePipe extends Pipe {
	static transform(value) {
		return value * 2;
	}
}
ExamplePipe.meta = {
	name: 'example',
};

class AppModule extends Module {}
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		ExamplePipe,
	],
	bootstrap: RootComponent,
};

const module = Browser.bootstrap(AppModule);
