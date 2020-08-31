import { Pipe } from "../../../../src/rxcomp";

export default class DatePipe extends Pipe {

	static transform(value: Date | string, locale = 'it-IT-u-ca-gregory', options: Intl.DateTimeFormatOptions = {
		dateStyle: 'short',
		timeStyle: 'short',
	} as Intl.DateTimeFormatOptions): string {
		const localeDateString = new Date(value).toLocaleDateString(locale, options);
		return localeDateString;
	}

	static meta = {
		name: 'date',
	};

}
