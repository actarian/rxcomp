export default class DatePipe {

	static transform(value, locale = 'it-IT-u-ca-gregory', options = {
		dateStyle: 'short',
		timeStyle: 'short',
	}) {
		const localeDateString = new Date(value).toLocaleDateString(locale, options);
		return localeDateString;
	}

}

DatePipe.meta = {
	name: 'date',
};
