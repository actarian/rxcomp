import { Browser, Component, CoreModule, Module, Pipe } from '../../src/rxcomp';

class RootComponent extends Component {
	time: Date = new Date();
	value: number = 2;
}
RootComponent.meta = {
	selector: '[root-component]',
};

class TimePipe extends Pipe {
	static transform(value: Date | string, options: number = 1): string {
		const date = new Date(value);
		return `${date.getHours()}:${date.getMinutes()}`;
	}
}
TimePipe.meta = {
	name: 'time',
};

class MultPipe extends Pipe {
	static transform(value: string | number, mult1: number = 2, mult2: number = 1): number {
		return Number(value) * Number(mult1) * Number(mult2);
	}
}
MultPipe.meta = {
	name: 'mult',
};

class AppModule extends Module { }
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
