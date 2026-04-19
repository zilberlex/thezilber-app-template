import { SvelteMap } from 'svelte/reactivity';

export type TouchMapMode = 'append' | 'prepend';

export class TouchMap<K, V> implements Iterable<[K, V]> {
	#map = new SvelteMap<K, V>();
	#ids = $state<K[]>([]);
	#mode: TouchMapMode;

	constructor(mode: TouchMapMode = 'append', entries?: Iterable<readonly [K, V]>) {
		this.#mode = mode;

		if (entries) {
			for (const [key, value] of entries) {
				this.set(key, value);
			}
		}
	}

	get size(): number {
		return this.#map.size;
	}

	has(key: K): boolean {
		return this.#map.has(key);
	}

	get(key: K): V | undefined {
		return this.#map.get(key);
	}

	set(key: K, value: V): this {
		if (this.#mode === 'append') {
			if (this.#map.has(key)) {
				this.#map.delete(key);
			}

			this.#map.set(key, value);
			return this;
		}

		this.#map.set(key, value);

		const oldIndex = this.#ids.indexOf(key);
		if (oldIndex !== -1) {
			this.#ids.splice(oldIndex, 1);
		}

		this.#ids.unshift(key);

		return this;
	}

	delete(key: K): boolean {
		const had = this.#map.delete(key);

		if (!had) {
			return false;
		}

		if (this.#mode === 'prepend') {
			const index = this.#ids.indexOf(key);
			if (index !== -1) {
				this.#ids.splice(index, 1);
			}
		}

		return true;
	}

	clear(): void {
		this.#map.clear();

		if (this.#mode === 'prepend') {
			this.#ids.length = 0;
		}
	}

	keys(): IterableIterator<K> {
		if (this.#mode === 'append') {
			return this.#map.keys();
		}

		return this.#iterateKeys();
	}

	values(): IterableIterator<V> {
		if (this.#mode === 'append') {
			return this.#map.values();
		}

		return this.#iterateValues();
	}

	entries(): IterableIterator<[K, V]> {
		if (this.#mode === 'append') {
			return this.#map.entries();
		}

		return this.#iterateEntries();
	}

	forEach(callbackfn: (value: V, key: K, map: TouchMap<K, V>) => void, thisArg?: unknown): void {
		for (const [key, value] of this.entries()) {
			callbackfn.call(thisArg, value, key, this);
		}
	}

	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries();
	}

	toValueArray(): V[] {
		return Array.from(this.values());
	}

	*#iterateKeys(): IterableIterator<K> {
		for (const key of this.#ids) {
			if (this.#map.has(key)) {
				yield key;
			}
		}
	}

	*#iterateValues(): IterableIterator<V> {
		for (const key of this.#ids) {
			const value = this.#map.get(key);
			if (value !== undefined || this.#map.has(key)) {
				yield value as V;
			}
		}
	}

	*#iterateEntries(): IterableIterator<[K, V]> {
		for (const key of this.#ids) {
			const value = this.#map.get(key);
			if (value !== undefined || this.#map.has(key)) {
				yield [key, value as V];
			}
		}
	}
}
