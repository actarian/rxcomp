import { Browser, Component, CoreModule, getContext, Module } from '../../../src/rxcomp';

class RootComponent extends Component {
	get count() {
		return this.count_;
	}
	set count(count:number) {
		this.count_ = count;
		this.items = new Array(count).fill(0).map((x, i) => i + 1);
	}
	onInit() {
		this.index = -1;
		let params = new URLSearchParams(document.location.search.substring(1));
		let paramCount = params.get('count');
		this.count = (paramCount ? parseInt(paramCount) : 10);
		// this.runTask();
	}
	setIndex(index:number) {
		this.index = index;
		this.pushChanges();
	}
	runTask() {
		setTimeout(() => {
			this.count = Math.floor(1 + Math.random() * 1000);
			this.pushChanges();
			this.runTask();
		}, 2000);
	}
}
RootComponent.meta = {
	selector: '[root-component]',
};

class ItemComponent extends Component {
	onInit() {
		const { node } = getContext(this);
		node.innerText = this.item;
	}
	/*
	onInit() {
		console.log('ItemComponent.onInit', this.item);
	}
	*/
}
ItemComponent.meta = {
	selector: '[item-component]',
	inputs: ['item'],
	// template: `<span [innerHTML]="item"></span>`,
};

class AppModule extends Module { }
AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		ItemComponent,
	],
	bootstrap: RootComponent,
};

Browser.bootstrap(AppModule);
