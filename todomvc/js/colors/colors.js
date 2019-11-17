export const colors = [
	{ hex: '#073B4C' },
	{ hex: '#EF476F' },
	{ hex: '#1CCC9D' },
	{ hex: '#118AB2' },
	{ hex: '#EFC156' },
];

export function hexToInt(hex) {
	return parseInt(hex.replace(/^#/, ''), 16);
}

export function randomHex() {
	return colors[Math.floor(Math.random() * colors.length)].hex;
}

export function randomColor() {
	const hex = randomHex();
	return hexToInt(hex);
}

export function color(index, alpha) {
	return hexToRgb(colors[index % colors.length].hex, alpha);
}

let index = -1;

export function nextHex() {
	index++;
	return colors[index % colors.length].hex;
}

export function nextColor() {
	const hex = nextHex();
	return hexToInt(hex);
}

export function hexToRgb(hex, a) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	if (a) {
		return `rgba(${r},${g},${b},${a})`;
	} else {
		return `rgb(${r},${g},${b})`;
	}
}
