export class OneToManyDictionary<TKey, TValue> {
	#map: Map<TKey, TValue[]>;
	#deduplicate: boolean;

	constructor(deduplicate = false) {
		this.#map = new Map<TKey, TValue[]>();
		this.#deduplicate = deduplicate;
	}

	add(key: TKey, value: TValue) {
		this.addValues(key, [value]);
	}

	addValues(key: TKey, values: TValue[]) {
		let currentValues = this.#map.get(key);
		if (currentValues) {
			currentValues = currentValues.concat(values);
		} else {
			currentValues = values;
		}

		if (this.#deduplicate) {
			this.#map.set(key, [...new Set(currentValues)]);
		} else {
			this.#map.set(key, currentValues);
		}
	}

	removeValues(key: TKey, values: TValue[]) {
		let currentValues = this.#map.get(key);
		if (currentValues) {
			values.forEach((value) => {
				let valueIndex = currentValues.indexOf(value);
				if (valueIndex > -1) {
					currentValues.splice(currentValues.indexOf(value), 1);
				}
			});

			if (currentValues.length == 0) {
				this.#map.delete(key);
			}
		}
	}

	remove(key: TKey, value: TValue) {
		this.removeValues(key, [value]);
	}

	get(key: TKey): TValue[] {
		return this.#map.get(key) ?? [];
	}

	has(key: TKey): boolean {
		return this.#map.has(key);
	}
}
