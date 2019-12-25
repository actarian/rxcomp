import { Browser, Component, CoreModule, Module, Pipe } from '../../src/rxcomp';

class RootComponent extends Component {
	onInit() {
		this.time = new Date();
		this.value = 2;
	}
}
RootComponent.meta = {
	selector: '[root-component]',
};

class TimePipe extends Pipe {
	static transform(value, options = 1) {
		const date = new Date(value);
		return `${date.getHours()}:${date.getMinutes()}`;
	}
}
TimePipe.meta = {
	name: 'time',
};

class MultPipe extends Pipe {
	static transform(value, mult1 = 2, mult2 = 1) {
		return Number(value) * Number(mult1) * Number(mult2);
	}
}
MultPipe.meta = {
	name: 'mult',
};

class AppModule extends Module {}
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		TimePipe,
		MultPipe
	],
	bootstrap: RootComponent,
};

Browser.bootstrap(AppModule);
