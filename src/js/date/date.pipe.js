

export default class DatePipe {

	static transform(value, locale = 'it-IT-u-ca-gregory', options = {
		dateStyle: 'short',
		timeStyle: 'short',
	}) {
		return new Date(value).toLocaleDateString(locale, options);
	}

}

DatePipe.meta = {
	name: 'date',
};
