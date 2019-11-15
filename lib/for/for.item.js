import Context from '../core/context';
// import Component from '../component/component';

export default class ForItem extends Context {

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

	get first() { return this.index === 0; }

	get last() { return this.index === this.count - 1; }

	get even() { return this.index % 2 === 0; }

	get odd() { return !this.even; }

}
