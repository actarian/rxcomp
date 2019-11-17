export function ATTRIBUTE_REGEX() {
	return /\[(.+)\]/;
}

export function HANDLEBARS_REGEX() {
	return /\{{2}((([^{}])|(\{[^{}]+?\}))*?)\}{2}/g;
	// return /\{{2}(?!\{)(.*?)\}{2}/g;
	// return /\{{2}(?!\{)(.*?\}*)\}{2}/g;
}
