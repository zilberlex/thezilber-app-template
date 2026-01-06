import type { KeyLike } from '../patterns/key';
import type { HotKeyModifier } from './types';

export const MODIFIER_INDEX: Record<HotKeyModifier, number> = {
	'ctrl|option': 0,
	alt: 1,
	shift: 2
} as const;

export class HotKey implements KeyLike {
	readonly key: string;
	readonly #flags: [boolean, boolean, boolean]; // [ctrl, shift, alt]

	constructor(key: string, ...modifiers: HotKeyModifier[]) {
		this.key = key.toLowerCase();
		this.#flags = [false, false, false];

		for (const mod of modifiers) {
			const idx = MODIFIER_INDEX[mod];
			this.#flags[idx] = true;
		}
	}

	get ctrlOrOption() {
		return this.#flags[MODIFIER_INDEX['ctrl|option']];
	}
	get alt() {
		return this.#flags[MODIFIER_INDEX['alt']];
	}
	get shift() {
		return this.#flags[MODIFIER_INDEX['shift']];
	}

	toKey(): string {
		const bits = this.#flags.map((f) => (f ? '1' : '0')).join('');
		return `${bits}:${this.key}`;
	}

	equals(other: HotKey): boolean {
		return this.toKey() === other.toKey();
	}

	toString(): string {
		let parts = [];

		if (this.#flags[MODIFIER_INDEX['ctrl|option']]) {
			parts.push('Ctrl');
		}

		if (this.#flags[MODIFIER_INDEX['alt']]) {
			parts.push('Alt');
		}

		if (this.#flags[MODIFIER_INDEX['shift']]) {
			parts.push('Shift');
		}

		parts.push(this.key.toUpperCase());

		return parts.join('+');
	}

	static fromEvent(event: KeyboardEvent): HotKey {
		const mods: HotKeyModifier[] = [];
		if (event.ctrlKey || event.metaKey) mods.push('ctrl|option');
		if (event.altKey) mods.push('alt');
		if (event.shiftKey) mods.push('shift');

		return new HotKey(event.key, ...mods);
	}
}
