import { PriorityList, type PriorityListEntry } from './priority-list';

interface MapListValue<K, V> {
	key: K;
	value: V;
}

export class MapList<K, V> implements Iterable<[K, V]> {
	#map = new Map<K, PriorityListEntry<MapListValue<K, V>>>();
	#list = new PriorityList<MapListValue<K, V>>();

	get size(): number {
		return this.#map.size;
	}

	has(key: K): boolean {
		return this.#map.has(key);
	}

	get(key: K): V | undefined {
		return this.#map.get(key)?.value.value;
	}

	set(key: K, value: V): this {
		const entry = this.#map.get(key);

		if (entry) {
			entry.value.value = value;
			return this;
		}

		this.push(key, value);
		return this;
	}

	push(key: K, value: V): number {
		this.#assertNewKey(key);

		const entry = this.#list.push({
			key,
			value
		});

		this.#map.set(key, entry);

		return this.size;
	}

	pop(): [K, V] | undefined {
		const value = this.#list.pop();

		if (!value) {
			return;
		}

		this.#map.delete(value.key);

		return [value.key, value.value];
	}

	delete(key: K): boolean {
		const entry = this.#map.get(key);

		if (!entry) {
			return false;
		}

		if (!this.#list.delete(entry)) {
			throw new Error('MapList internal index invariant violated.');
		}

		this.#map.delete(key);

		return true;
	}

	clear(): void {
		this.#list.clear();
		this.#map.clear();
	}

	at(index: number): V | undefined {
		return this.#list.at(index)?.value;
	}

	entryAt(index: number): [K, V] | undefined {
		const entry = this.#list.at(index);

		if (!entry) {
			return;
		}

		return [entry.key, entry.value];
	}

	keyAt(index: number): K | undefined {
		return this.#list.at(index)?.key;
	}

	indexOf(key: K): number {
		return this.#map.get(key)?.index ?? -1;
	}

	*keys(): IterableIterator<K> {
		for (const entry of this.#list) {
			yield entry.key;
		}
	}

	*values(): IterableIterator<V> {
		for (const entry of this.#list) {
			yield entry.value;
		}
	}

	*entries(): IterableIterator<[K, V]> {
		for (const entry of this.#list) {
			yield [entry.key, entry.value];
		}
	}

	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries();
	}

	forEach(callback: (value: V, key: K, mapList: MapList<K, V>) => void, thisArg?: unknown): void {
		for (const entry of this.#list) {
			callback.call(thisArg, entry.value, entry.key, this);
		}
	}

	protected insertWithPriority(key: K, value: V, priority: number): number {
		this.#assertNewKey(key);

		const entry = this.#list.insert(
			{
				key,
				value
			},
			priority
		);

		this.#map.set(key, entry);

		return this.size;
	}

	protected getPriorityForKey(key: K): number | undefined {
		return this.#map.get(key)?.priority;
	}

	protected getPriorityAt(index: number): number | undefined {
		return this.#list.priorityAt(index);
	}

	protected setPriorityForKey(key: K, priority: number): boolean {
		const entry = this.#map.get(key);

		if (!entry) {
			return false;
		}

		return this.#list.setPriority(entry, priority);
	}

	#assertNewKey(key: K): void {
		if (this.#map.has(key)) {
			throw new Error('MapList cannot push a duplicate key.');
		}
	}
}
