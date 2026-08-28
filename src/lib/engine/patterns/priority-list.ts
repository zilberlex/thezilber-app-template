export interface PriorityListEntry<T> {
	readonly value: T;
	readonly priority: number;
	readonly index: number;
}

interface MutablePriorityListEntry<T> {
	value: T;
	priority: number;
	index: number;
}

export class PriorityList<T> implements Iterable<T> {
	#entries: MutablePriorityListEntry<T>[] = [];

	get size(): number {
		return this.#entries.length;
	}

	at(index: number): T | undefined {
		return this.#entries.at(index)?.value;
	}

	entryAt(index: number): PriorityListEntry<T> | undefined {
		return this.#entries.at(index);
	}

	priorityAt(index: number): number | undefined {
		return this.#entries.at(index)?.priority;
	}

	indexOf(entry: PriorityListEntry<T>): number {
		return this.#ownsEntry(entry) ? entry.index : -1;
	}

	/**
	 * Appends with an automatically assigned priority.
	 *
	 * First automatic priority is 1.
	 * Every following automatic priority is the current last priority + 1.
	 */
	push(value: T): PriorityListEntry<T> {
		const priority = this.#nextPriority();

		const entry: MutablePriorityListEntry<T> = {
			value,
			priority,
			index: this.#entries.length
		};

		this.#entries.push(entry);

		return entry;
	}

	/**
	 * Inserts according to explicit priority.
	 *
	 * Lower priority numbers come first.
	 * Equal-priority entries are inserted after existing entries
	 * with that priority.
	 */
	insert(value: T, priority: number): PriorityListEntry<T> {
		this.#assertPriority(priority);

		const index = this.#upperBound(priority);

		const entry: MutablePriorityListEntry<T> = {
			value,
			priority,
			index
		};

		this.#entries.splice(index, 0, entry);
		this.#repairIndexes(index + 1);

		return entry;
	}

	/**
	 * Changes priority without looking the entry up in the array.
	 *
	 * The entry's stored index gives us the old position directly.
	 */
	setPriority(entry: PriorityListEntry<T>, priority: number): boolean {
		this.#assertPriority(priority);

		if (!this.#ownsEntry(entry)) {
			return false;
		}

		const mutableEntry = entry as MutablePriorityListEntry<T>;

		if (mutableEntry.priority === priority) {
			return true;
		}

		const oldIndex = mutableEntry.index;

		this.#entries.splice(oldIndex, 1);

		mutableEntry.priority = priority;

		const newIndex = this.#upperBound(priority);

		this.#entries.splice(newIndex, 0, mutableEntry);

		this.#repairIndexes(Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex));

		return true;
	}

	delete(entry: PriorityListEntry<T>): boolean {
		if (!this.#ownsEntry(entry)) {
			return false;
		}

		const mutableEntry = entry as MutablePriorityListEntry<T>;
		const index = mutableEntry.index;

		this.#entries.splice(index, 1);
		mutableEntry.index = -1;

		this.#repairIndexes(index);

		return true;
	}

	pop(): T | undefined {
		const entry = this.#entries.pop();

		if (!entry) {
			return;
		}

		entry.index = -1;

		return entry.value;
	}

	clear(): void {
		for (const entry of this.#entries) {
			entry.index = -1;
		}

		this.#entries.length = 0;
	}

	*values(): IterableIterator<T> {
		for (const entry of this.#entries) {
			yield entry.value;
		}
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this.values();
	}

	#nextPriority(): number {
		const lastEntry = this.#entries[this.#entries.length - 1];

		if (!lastEntry) {
			return 1;
		}

		const priority = lastEntry.priority + 1;

		if (!Number.isFinite(priority) || priority <= lastEntry.priority) {
			throw new RangeError('Unable to allocate the next automatic priority.');
		}

		return priority;
	}

	/**
	 * Finds the position immediately after the existing entries
	 * with the supplied priority.
	 */
	#upperBound(priority: number): number {
		let low = 0;
		let high = this.#entries.length;

		while (low < high) {
			const middle = Math.floor((low + high) / 2);

			if (this.#entries[middle].priority <= priority) {
				low = middle + 1;
			} else {
				high = middle;
			}
		}

		return low;
	}

	#repairIndexes(start: number, end = this.#entries.length - 1): void {
		for (let index = start; index <= end; index++) {
			this.#entries[index].index = index;
		}
	}

	#ownsEntry(entry: PriorityListEntry<T>): boolean {
		const index = entry.index;

		return Number.isInteger(index) && index >= 0 && index < this.#entries.length && this.#entries[index] === entry;
	}

	#assertPriority(priority: number): void {
		if (!Number.isFinite(priority)) {
			throw new RangeError('Priority must be a finite number.');
		}
	}
}
