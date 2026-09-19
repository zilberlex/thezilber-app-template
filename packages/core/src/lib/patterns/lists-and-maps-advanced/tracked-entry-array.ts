export interface TrackedEntry {
	index: number;
}

export class TrackedEntryArray<T extends TrackedEntry> implements Iterable<T> {
	#entries: T[] = [];

	get size(): number {
		return this.#entries.length;
	}

	at(index: number): T | undefined {
		return this.#entries.at(index);
	}

	indexOf(entry: T): number {
		return this.#ownsEntry(entry) ? entry.index : -1;
	}

	push(entry: T): number {
		this.#assertDetached(entry);

		return this.#append(entry);
	}

	insert(index: number, entry: T): number {
		this.#assertInsertIndex(index);
		this.#assertDetached(entry);

		if (index === this.#entries.length) {
			return this.#append(entry);
		}

		entry.index = index;

		this.#entries.splice(index, 0, entry);
		this.#repairIndexes(index + 1);

		return this.size;
	}

	move(entry: T, index: number): boolean {
		if (!this.#ownsEntry(entry)) {
			return false;
		}

		this.#assertMoveIndex(index);

		const oldIndex = entry.index;

		if (oldIndex === index) {
			return true;
		}

		this.#entries.splice(oldIndex, 1);
		this.#entries.splice(index, 0, entry);

		this.#repairIndexes(Math.min(oldIndex, index), Math.max(oldIndex, index));

		return true;
	}

	delete(entry: T): boolean {
		if (!this.#ownsEntry(entry)) {
			return false;
		}

		const index = entry.index;

		this.#entries.splice(index, 1);
		entry.index = -1;

		this.#repairIndexes(index);

		return true;
	}

	pop(): T | undefined {
		const entry = this.#entries.pop();

		if (!entry) {
			return;
		}

		entry.index = -1;

		return entry;
	}

	clear(): void {
		for (const entry of this.#entries) {
			entry.index = -1;
		}

		this.#entries.length = 0;
	}

	*values(): IterableIterator<T> {
		yield* this.#entries;
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this.values();
	}

	#append(entry: T): number {
		entry.index = this.#entries.length;
		this.#entries.push(entry);

		return this.size;
	}

	#repairIndexes(start: number, end = this.#entries.length - 1): void {
		for (let index = start; index <= end; index++) {
			this.#entries[index].index = index;
		}
	}

	#ownsEntry(entry: T): boolean {
		const index = entry.index;

		return Number.isInteger(index) && index >= 0 && index < this.#entries.length && this.#entries[index] === entry;
	}

	#assertDetached(entry: T): void {
		if (entry.index !== -1) {
			throw new Error('TrackedEntryArray cannot insert an already tracked entry.');
		}
	}

	#assertInsertIndex(index: number): void {
		if (!Number.isInteger(index) || index < 0 || index > this.size) {
			throw new RangeError(`TrackedEntryArray insertion index out of range: ${index}`);
		}
	}

	#assertMoveIndex(index: number): void {
		if (!Number.isInteger(index) || index < 0 || index >= this.size) {
			throw new RangeError(`TrackedEntryArray move index out of range: ${index}`);
		}
	}
}
