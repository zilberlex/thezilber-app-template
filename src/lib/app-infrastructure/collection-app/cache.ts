export class Cache<TKey, TValue> {
	// TODO AZ max capacity
	// TODO AZ move to another place
	#map = new Map<TKey, TValue>();

	async get(key: TKey) {
		let item = this.#map.get(key);

		return item;
	}

	async setOrUpdateKey(key: TKey, value: TValue, oldKey?: TKey) {
		if (oldKey) {
			this.#map.delete(oldKey);
		}

		this.#map.set(key, value);
	}

	async delete(key: TKey) {
		this.#map.delete(key);
	}
}
