import Context from '../core/context';

export default class ForItem extends Context {

	index: number;
	count: number;
	// !!! try with payload options { key, $key, value, $value, index, count } or use onInit()

	constructor(key, $key, value, $value, index, count, parentInstance) {
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
