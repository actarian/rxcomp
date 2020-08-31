export const colors = [
	{ hex: '#ffffff', background: '#ffffff', foreground: '#003adc', accent: '#212121' },
	{ hex: '#212121', background: '#212121', foreground: '#ffffff', accent: '#003adc' },
	{ hex: '#ffffff', background: '#ffffff', foreground: '#212121', accent: '#003adc' },
	{ hex: '#003adc', background: '#003adc', foreground: '#ffffff', accent: '#212121' },
];

export function hexToInt(hex: string): number {
	return parseInt(hex.replace(/^#/, ''), 16);
}

export function randomHex(): string {
	return colors[Math.floor(Math.random() * colors.length)].hex;
}

export function randomColor(): number {
	const hex = randomHex();
	return hexToInt(hex);
}

export function color(index: number, alpha: number): string {
	return hexToRgb(colors[index % colors.length].hex, alpha);
}

export function background(index: number, alpha?: number): string {
	return hexToRgb(colors[index % colors.length].background, alpha);
}

export function foreground(index: number, alpha?: number): string {
	return hexToRgb(colors[index % colors.length].foreground, alpha);
}

export function accent(index: number, alpha?: number): string {
	return hexToRgb(colors[index % colors.length].accent, alpha);
}

let index: number = -1;

export function nextHex() {
	index++;
	return colors[index % colors.length].hex;
}

export function nextColor(): number {
	const hex = nextHex();
	return hexToInt(hex);
}

export function hexToRgb(hex: string, a?: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	if (a) {
		return `rgba(${r},${g},${b},${a})`;
	} else {
		return `rgb(${r},${g},${b})`;
	}
}
