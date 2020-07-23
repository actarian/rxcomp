import Component from '../core/component';
export default class JsonComponent extends Component {
    constructor() {
        super(...arguments);
        this.active = false;
    }
    onToggle() {
        this.active = !this.active;
        this.pushChanges();
    }
}
JsonComponent.meta = {
    selector: 'json-component',
    inputs: ['item'],
    template: `
		<div class="rxc-block">
			<div class="rxc-head">
				<span class="rxc-head__title" (click)="onToggle()">
					<span *if="!active">+ json </span>
					<span *if="active">- json </span>
					<span [innerHTML]="item"></span>
				</span>
			</div>
			<ul class="rxc-list" *if="active">
				<li class="rxc-list__item">
					<span class="rxc-list__value" [innerHTML]="item | json"></span>
				</li>
			</ul>
		</div>`,
};
