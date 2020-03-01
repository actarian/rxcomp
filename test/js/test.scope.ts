import { BehaviorSubject } from 'rxjs';
import { Browser, Component, CoreModule, Directive, Module, StyleDirective } from '../../src/rxcomp';

class RootComponent extends Component {
	background = '#b9dbff';
	items = [1, 2, 3];
	href = 'https://github.com/actarian/rxcomp';

	onItem(item: number) {
		console.log('RootComponent.item', item);
	}
}
RootComponent.meta = {
	selector: '[root-component]',
};

class SubComponent extends Component {
	background = '#ffb9b9';
	toggle?: BehaviorSubject<any>;
	item?: number;

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
		console.log('style', this.style);
	}
}
HostDirective.meta = {
	selector: '[host]',
	hosts: { style: StyleDirective }
};

class HostedDirective extends Directive {
	host?: HostDirective;

	onInit() {
		console.log('host', this.host);
	}
}
HostedDirective.meta = {
	selector: '[hosted]',
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
