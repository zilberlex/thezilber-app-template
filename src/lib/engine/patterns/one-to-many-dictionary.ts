import { isKeyLike, type KeyLike, type PrimitiveKey } from './key';

export class OneToManyDictionary<TKey extends KeyLike | PrimitiveKey, TValue> {
	#map: Map<TKey | string, TValue[]>;
	#deduplicate: boolean;

	constructor(deduplicate = false) {
		this.#map = new Map<TKey | string, TValue[]>();
		this.#deduplicate = deduplicate;
	}

	add(key: TKey, value: TValue) {
		this.addValues(key, [value]);
	}

	addValues(key: TKey, values: TValue[]) {
		const normlizedKey = this.normalizeKey(key);
		let currentValues = this.#map.get(normlizedKey);
		if (currentValues) {
			currentValues = currentValues.concat(values);
		} else {
			currentValues = values;
		}

		if (this.#deduplicate) {
			this.#map.set(normlizedKey, [...new Set(currentValues)]);
		} else {
			this.#map.set(normlizedKey, currentValues);
		}
	}

	removeValues(key: TKey, values: TValue[]) {
		const normlizedKey = this.normalizeKey(key);
		let currentValues = this.#map.get(normlizedKey);
		if (currentValues) {
			values.forEach((value) => {
				let valueIndex = currentValues.indexOf(value);
				if (valueIndex > -1) {
					currentValues.splice(currentValues.indexOf(value), 1);
				}
			});

			if (currentValues.length == 0) {
				this.#map.delete(normlizedKey);
			}
		}
	}

	remove(key: TKey, value: TValue) {
		this.removeValues(key, [value]);
	}

	get(key: TKey): TValue[] {
		return this.#map.get(this.normalizeKey(key)) ?? [];
	}

	has(key: TKey): boolean {
		return this.#map.has(this.normalizeKey(key));
	}
	private normalizeKey(key: TKey): string | TKey {
		return isKeyLike(key) ? key.toKey() : key;
	}
}
