import { interval } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Browser, Component, CoreModule, Module, Pipe } from '../../src/rxcomp';

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
	bootstrap: AppComponent,
};

const module = Browser.bootstrap(AppModule);
