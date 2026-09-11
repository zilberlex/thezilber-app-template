import type { KeyLike } from '../patterns/key';
import type { KbKeyModifier } from './types';

export const MODIFIER_INDEX: Record<KbKeyModifier, number> = {
	'ctrl|meta': 0,
	alt: 1,
	shift: 2
} as const;

const ALL_MODIFIERS: KbKeyModifier[] = ['ctrl|meta', 'alt', 'shift'];

export class KbKey implements KeyLike {
	readonly key: string;
	readonly #flags: [boolean, boolean, boolean]; // [ctrl|option, alt, shift]

	constructor(key: string, ...modifiers: KbKeyModifier[]) {
		this.key = key.toLowerCase();
		this.#flags = [false, false, false];

		for (const mod of modifiers) {
			const idx = MODIFIER_INDEX[mod];
			this.#flags[idx] = true;
		}
	}

	get ctrlOrMeta() {
		return this.#flags[MODIFIER_INDEX['ctrl|meta']];
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

	equals(other: KbKey): boolean {
		return this.toKey() === other.toKey();
	}

	test(eventKey: KbKey): number {
		const expectedModifierCount = this.#flags.filter(Boolean).length;
		let score = -1 - expectedModifierCount;

		const keyMatches = this.key === eventKey.key;

		if (keyMatches) {
			score++;
		}

		let matchedExpectedModifiers = 0;
		let extraModifiers = 0;

		for (let i = 0; i < this.#flags.length; i++) {
			const bindingRequiresModifier = this.#flags[i];
			const eventHasModifier = eventKey.#flags[i];

			if (bindingRequiresModifier && eventHasModifier) {
				matchedExpectedModifiers++;
				score++;
			} else if (!bindingRequiresModifier && eventHasModifier) {
				extraModifiers++;
			}
		}

		const expectedBindingMatched = keyMatches && matchedExpectedModifiers === expectedModifierCount;

		if (expectedBindingMatched) {
			score += extraModifiers;
		}

		return score;
	}

	matches(eventKey: KbKey, exact = false): boolean {
		return exact ? this.equals(eventKey) : this.test(eventKey) >= 0;
	}

	toString(): string {
		const parts: string[] = [];

		if (this.#flags[MODIFIER_INDEX['ctrl|meta']]) {
			parts.push('Ctrl|Meta');
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

	static fromEvent(event: KeyboardEvent): KbKey {
		const mods: KbKeyModifier[] = [];

		if (event.ctrlKey || event.metaKey) mods.push('ctrl|meta');
		if (event.altKey) mods.push('alt');
		if (event.shiftKey) mods.push('shift');

		return new KbKey(event.key, ...mods);
	}

	pickBestMatch<T>(entries: Array<{ hotKey: KbKey; cbObject: T }>): T | undefined {
		let bestScore = Infinity;
		let bestValue: T | undefined;

		for (const entry of entries) {
			const score = entry.hotKey.test(this);

			if (score >= 0 && score < bestScore) {
				bestScore = score;
				bestValue = entry.cbObject;
			}
		}

		return bestValue;
	}

	#getRequiredModifiers(): KbKeyModifier[] {
		const result: KbKeyModifier[] = [];

		for (const mod of ALL_MODIFIERS) {
			if (this.#flags[MODIFIER_INDEX[mod]]) {
				result.push(mod);
			}
		}

		return result;
	}

	getPossibleRegisteredMatches(): KbKey[] {
		const activeMods = this.#getRequiredModifiers();
		const results: KbKey[] = [];

		const recurse = (index: number, currentMods: KbKeyModifier[]) => {
			if (index >= activeMods.length) {
				results.push(new KbKey(this.key, ...currentMods));
				return;
			}

			// without this modifier
			recurse(index + 1, currentMods);

			// with this modifier
			recurse(index + 1, [...currentMods, activeMods[index]]);
		};

		recurse(0, []);

		return results;
	}

	bestMatchingSetIndex(hotkeySets: KbKey[][]): number | undefined {
		let bestScore = -1;
		let bestSetIndex: number | undefined = undefined;

		for (let setIndex = 0; setIndex < hotkeySets.length; setIndex++) {
			const hotkeys = hotkeySets[setIndex];

			for (const hotkey of hotkeys) {
				const score = this.test(hotkey);

				if (score > bestScore) {
					bestScore = score;
					bestSetIndex = setIndex;
				}
			}
		}

		return bestScore >= 0 ? bestSetIndex : undefined;
	}
}
