import { TrackedEntryArray } from './tracked-entry-array';

interface MapListEntry<K, V> {
	key: K;
	value: V;
	index: number;
}

export class MapList<K, V> implements Iterable<[K, V]> {
	#entries = new TrackedEntryArray<MapListEntry<K, V>>();
	#map = new Map<K, MapListEntry<K, V>>();

	get size(): number {
		return this.#entries.size;
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

		return [entry.key, entry.value];
	}

	delete(key: K): boolean {
		const entry = this.#map.get(key);

		if (!entry) {
			return false;
		}

		if (!this.#entries.delete(entry)) {
			throw new Error('MapList internal entry invariant violated.');
		}

		this.#map.delete(key);

		return true;
	}

	clear(): void {
		this.#entries.clear();
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

		const entry: MapListEntry<K, V> = {
			key,
			value,
			index: -1
		};

		this.#entries.insert(index, entry);
		this.#map.set(key, entry);

		return this.size;
	}

	protected moveToIndex(key: K, index: number): boolean {
		const entry = this.#map.get(key);

		if (!entry) {
			return false;
		}

		if (!this.#entries.move(entry, index)) {
			throw new Error('MapList internal entry invariant violated.');
		}

		return true;
	}

	#assertNewKey(key: K): void {
		if (this.#map.has(key)) {
			throw new Error('MapList cannot contain duplicate keys.');
		}
	}
}
