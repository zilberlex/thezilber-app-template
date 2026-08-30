import { assertPriority, nextPriority, priorityUpperBound } from './priority-utils';

export interface PriorityListEntry<T> {
	readonly value: T;
	readonly priority: number;
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
		const mutableEntry = entry as MutablePriorityListEntry<T>;

		return this.#ownsEntry(mutableEntry) ? mutableEntry.index : -1;
	}

	/**
	 * Appends with an automatically assigned priority.
	 *
	 * First automatic priority is 1.
	 * Every following automatic priority is the current last priority + 1.
	 */
	push(value: T): PriorityListEntry<T> {
		const lastPriority = this.#entries.at(-1)?.priority;
		const priority = nextPriority(lastPriority);

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
		assertPriority(priority);

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
		assertPriority(priority);

		const mutableEntry = entry as MutablePriorityListEntry<T>;

		if (!this.#ownsEntry(mutableEntry)) {
			return false;
		}

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
		const mutableEntry = entry as MutablePriorityListEntry<T>;

		if (!this.#ownsEntry(mutableEntry)) {
			return false;
		}
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

	#upperBound(priority: number): number {
		return priorityUpperBound(this.#entries.length, (index) => this.#entries[index].priority, priority);
	}

	#repairIndexes(start: number, end = this.#entries.length - 1): void {
		for (let index = start; index <= end; index++) {
			this.#entries[index].index = index;
		}
	}

	#ownsEntry(entry: MutablePriorityListEntry<T>): boolean {
		const index = entry.index;

		return Number.isInteger(index) && index >= 0 && index < this.#entries.length && this.#entries[index] === entry;
	}
}
