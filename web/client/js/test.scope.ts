import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Browser, Component, CoreModule, Directive, ErrorInterceptors, Factory, getContext, IErrorHandler, IErrorInterceptor, Module, StyleDirective } from '../../../src/rxcomp';

class CustomErrorInterceptor implements IErrorInterceptor {
	intercept(error: Error, next: IErrorHandler): Observable<Error | void> {
		return next.handle(error).pipe(
			map((error: Error | void) => {
				console.warn(error);
				return;
			})
		);
	}
}

ErrorInterceptors.push(new CustomErrorInterceptor());

class RootComponent extends Component {
	background = '#b9dbff';
	items = [1, 2, 3];
	href = 'https://github.com/actarian/rxcomp';
	src = 'https://source.unsplash.com/random/400x300';

	onItem(item: number) {
		console.log('RootComponent.onItem.item', item);
	}

	onHandled(event: any) {
		console.log('RootComponent.onHandled', event);
	}
}
RootComponent.meta = {
	selector: '[root-component]',
};

class SubComponent extends Component {
	background = '#ffb9b9';
	toggle?: BehaviorSubject<any>;
	item?: number;

	onInit() {
		console.log('SubComponent.onInit.item', this.item);
	}

	onChanges(changes: Factory) {
		console.log('SubComponent.onChanges.item', this.item);
	}

	onToggle() {
		// console.log(this.item);
		this.toggle!.next(this.item);
	}
}
SubComponent.meta = {
	selector: '[sub-component]:not(.red)',
	inputs: ['item'],
	outputs: ['toggle'],
	template: `<div [style]="{ 'background-color': background }" (click)="onToggle()" [innerHTML]="item"></div>`
};

class HostDirective extends Directive {
	style: any;

	onInit() {
		console.log('HostDirective.onInit.style', this.style);
		console.log('HostDirective.onInit.input', this.input);
	}

	onChanges(changes: Factory) {
		console.log('HostDirective.onChanges.input', this.input);
	}
}
HostDirective.meta = {
	selector: '[host]',
	inputs: ['input'],
	hosts: { style: StyleDirective }
};

class HostedDirective extends Directive {
	host?: HostDirective;

	onInit() {
		console.log('host', this.host);
		const { node } = getContext(this);
		fromEvent(node, 'click').pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(event => {
			this.handled.next(event);
			this.unhandled.next(event);
		});
		console.log('HostedDirective.onInit.host.input', this.host!.input);
	}

	onChanges(changes: Factory) {
		console.log('HostedDirective.onChanges.host.input', this.host!.input);
	}
}
HostedDirective.meta = {
	selector: '[hosted]',
	outputs: ['handled', 'unhandled'],
	hosts: { host: HostDirective }
};

class AppModule extends Module { }
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		HostedDirective,
		HostDirective,
		SubComponent
	],
	bootstrap: RootComponent,
};

Browser.bootstrap(AppModule);
