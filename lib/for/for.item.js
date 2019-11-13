import Context from '../context/context';

export default class ForItem extends Context {

	constructor($key, $value, index, array, parentInstance) {
		super(parentInstance, {
			[$key]: {
				get: function() {
					return this.$value;
				},
				set: function(value) {
					this.$value = value;
				}
			}
		});
		this.$key = $key;
		this.$value = $value;
		this.index = index;
		this.count = array.length;
		// console.log(this);
	}

	get first() { return this.index === 0; }

	get last() { return this.index === this.count - 1; }

	get even() { return this.index % 2 === 0; }

	get odd() { return !this.even; }

	pushState() {
		this.state$.next(this);
	}

}
