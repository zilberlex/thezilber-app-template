export class MruMap<TKey, TValue> {
	#items = new Map<TKey, TValue>();

	set(key: TKey, value: TValue) {
		this.#items.delete(key);
		this.#items.set(key, value);
	}

	touch(key: TKey) {
		const value = this.#items.get(key);
		if (value === undefined) throw new Error(`Item was not registered. key: ${key}`);

		this.#items.delete(key);
		this.#items.set(key, value);
	}

	get(key: TKey) {
		return this.#items.get(key);
	}

	delete(key: TKey) {
		return this.#items.delete(key);
	}

	has(key: TKey) {
		return this.#items.has(key);
	}

	getAll() {
		return this.#items.entries();
	}

	get current(): TValue | undefined {
		return this.#items.values().next().value;
	}
}
