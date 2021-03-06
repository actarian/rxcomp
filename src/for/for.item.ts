import Context from '../core/context';
import Factory from '../core/factory';

export default class ForItem extends Context {
	index: number;
	count: number;
	[key: string]: any;
	// !!! todo: payload options { key, $key, value, $value, index, count }
	constructor(key: string, $key: number | string, value: string, $value: any, index: number, count: number, parentInstance: Factory) {
		// console.log('ForItem', arguments);
		super(parentInstance);
		/*
		super(parentInstance, {
			[key]: {
				get: function() {
					return this.$key;
				},
				set: function(key) {
					this.$key = key;
				}
			},
			[value]: {
				get: function() {
					return this.$value;
				},
				set: function(value) {
					this.$value = value;
				}
			}
		});
		*/
		this[key] = $key;
		this[value] = $value;
		this.index = index;
		this.count = count;
	}
	get first(): boolean { return this.index === 0; }
	get last(): boolean { return this.index === this.count - 1; }
	get even(): boolean { return this.index % 2 === 0; }
	get odd(): boolean { return !this.even; }
}
