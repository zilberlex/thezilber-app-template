export type KeyCheckFn = (event: KeyboardEvent) => boolean;
export type KeyboardEventKeyType = string | KeyCheckFn | (string | KeyCheckFn)[];

export function isPlus(e: KeyboardEvent): boolean {
	// Accept actual "+" (any layout), Numpad "Add", and US top-row "=" with Shift
	return e.key === '+'
		|| e.code === 'NumpadAdd'
		|| e.code === 'Equal';
}

export function isMinus(e: KeyboardEvent): boolean {
	// Accept actual "-" (any layout), Numpad "Subtract", and US top-row "-" with Shift
	return e.key === '-'
		|| e.code === 'NumpadSubtract'
		|| e.code === 'Minus';
}