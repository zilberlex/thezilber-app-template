type CacheEntry<TVal> = {
	value: TVal;
	timeout: number;
};

export class TTLMap<TKey, TVal> {
	#values: Map<TKey, CacheEntry<TVal>> = new Map();
	#timeoutMs: number;

	constructor(timeoutMs: number) {
		this.#timeoutMs = timeoutMs;
	}

	set(key: TKey, value: TVal) {
		const entry: CacheEntry<TVal> = this.#values.get(key) ?? ({} as CacheEntry<TVal>);

		entry.value = value;
		this.#refreshTimout(key, entry);

		this.#values.set(key, entry);
	}

	get(key: TKey, refreshTimout: boolean = true): TVal | undefined {
		let entry = this.#values.get(key);

		if (entry && refreshTimout) {
			this.#refreshTimout(key, entry);
		}

		return entry?.value;
	}

	#refreshTimout(key: TKey, entry: CacheEntry<TVal>) {
		clearTimeout(entry.timeout);

		entry.timeout = setTimeout(() => {
			this.#values.delete(key);
		}, this.#timeoutMs);
	}
}

// funcitno createEntry<TVal>(value: TVal): CacheEntry<TVal>
