export class RecentItemsCache<T> {
	#items: T[] = [];

	constructor(private readonly maxSize = 10) {
		if (maxSize < 1) {
			throw new Error('RecentItemsCache maxSize must be at least 1');
		}
	}

	add(item: T): void {
		// Optional: remove existing copy so the newest add moves it to the front.
		this.#items.unshift(item);

		if (this.#items.length > this.maxSize) {
			this.#items.length = this.maxSize;
		}
	}

	getAll(): T[] {
		return [...this.#items];
	}

	persist(): T[] {
		return [...this.#items];
	}

	hydrate(items: T[]) {
		this.#items = [...items];
	}

	getLatest(): T | undefined {
		return this.#items[0];
	}

	clear(): void {
		this.#items = [];
	}

	get size(): number {
		return this.#items.length;
	}
}
