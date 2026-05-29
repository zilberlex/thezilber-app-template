export class ItemCache<TKey, TValue> {
	// TODO AZ max capacity
	// TODO AZ move to another place
	#map = new Map<TKey, TValue>();

	get(key: TKey) {
		let item = this.#map.get(key);

		return item;
	}

	setOrUpdateKey(key: TKey, value: TValue, oldKey?: TKey) {
		if (oldKey) {
			this.#map.delete(oldKey);
		}

		this.#map.set(key, value);
	}

	delete(key: TKey) {
		this.#map.delete(key);
	}
}
