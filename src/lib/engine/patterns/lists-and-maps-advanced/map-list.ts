interface MapListEntry<K, V> {
	key: K;
	value: V;
	index: number;
}

export class MapList<K, V> implements Iterable<[K, V]> {
	#entries: MapListEntry<K, V>[] = [];
	#map = new Map<K, MapListEntry<K, V>>();

	get size(): number {
		return this.#entries.length;
	}

	has(key: K): boolean {
		return this.#map.has(key);
	}

	get(key: K): V | undefined {
		return this.#map.get(key)?.value;
	}

	set(key: K, value: V): this {
		const entry = this.#map.get(key);

		if (entry) {
			entry.value = value;
			return this;
		}

		this.push(key, value);
		return this;
	}

	push(key: K, value: V): number {
		return this.insertAt(this.size, key, value);
	}

	pop(): [K, V] | undefined {
		const entry = this.#entries.pop();

		if (!entry) {
			return;
		}

		this.#map.delete(entry.key);
		entry.index = -1;

		return [entry.key, entry.value];
	}

	delete(key: K): boolean {
		const entry = this.#map.get(key);

		if (!entry) {
			return false;
		}

		const index = entry.index;

		if (this.#entries[index] !== entry) {
			throw new Error('MapList internal index invariant violated.');
		}

		this.#entries.splice(index, 1);
		this.#map.delete(key);

		entry.index = -1;
		this.#repairIndexes(index);

		return true;
	}

	clear(): void {
		for (const entry of this.#entries) {
			entry.index = -1;
		}

		this.#entries.length = 0;
		this.#map.clear();
	}

	at(index: number): V | undefined {
		return this.#entries.at(index)?.value;
	}

	entryAt(index: number): [K, V] | undefined {
		const entry = this.#entries.at(index);

		if (!entry) {
			return;
		}

		return [entry.key, entry.value];
	}

	keyAt(index: number): K | undefined {
		return this.#entries.at(index)?.key;
	}

	indexOf(key: K): number {
		return this.#map.get(key)?.index ?? -1;
	}

	*keys(): IterableIterator<K> {
		for (const entry of this.#entries) {
			yield entry.key;
		}
	}

	*values(): IterableIterator<V> {
		for (const entry of this.#entries) {
			yield entry.value;
		}
	}

	*entries(): IterableIterator<[K, V]> {
		for (const entry of this.#entries) {
			yield [entry.key, entry.value];
		}
	}

	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries();
	}

	forEach(callback: (value: V, key: K, mapList: MapList<K, V>) => void, thisArg?: unknown): void {
		for (const entry of this.#entries) {
			callback.call(thisArg, entry.value, entry.key, this);
		}
	}

	protected insertAt(index: number, key: K, value: V): number {
		this.#assertNewKey(key);
		this.#assertInsertIndex(index);

		const entry: MapListEntry<K, V> = {
			key,
			value,
			index
		};

		if (index === this.#entries.length) {
			this.#entries.push(entry);
		} else {
			this.#entries.splice(index, 0, entry);
			this.#repairIndexes(index + 1);
		}

		this.#map.set(key, entry);

		return this.size;
	}

	protected moveToIndex(key: K, index: number): boolean {
		const entry = this.#map.get(key);

		if (!entry) {
			return false;
		}

		this.#assertMoveIndex(index);

		const oldIndex = entry.index;

		if (oldIndex === index) {
			return true;
		}

		if (this.#entries[oldIndex] !== entry) {
			throw new Error('MapList internal index invariant violated.');
		}

		this.#entries.splice(oldIndex, 1);
		this.#entries.splice(index, 0, entry);

		this.#repairIndexes(Math.min(oldIndex, index), Math.max(oldIndex, index));

		return true;
	}

	#repairIndexes(start: number, end = this.#entries.length - 1): void {
		for (let index = start; index <= end; index++) {
			this.#entries[index].index = index;
		}
	}

	#assertNewKey(key: K): void {
		if (this.#map.has(key)) {
			throw new Error('MapList cannot push a duplicate key.');
		}
	}

	#assertInsertIndex(index: number): void {
		if (!Number.isInteger(index) || index < 0 || index > this.size) {
			throw new RangeError(`MapList insertion index out of range: ${index}`);
		}
	}

	#assertMoveIndex(index: number): void {
		if (!Number.isInteger(index) || index < 0 || index >= this.size) {
			throw new RangeError(`MapList move index out of range: ${index}`);
		}
	}
}
