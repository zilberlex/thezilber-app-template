import { assertPriority, nextPriority, priorityUpperBound } from './priority-utils';
import { TrackedEntryArray } from './tracked-entry-array';

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
	#entries = new TrackedEntryArray<MutablePriorityListEntry<T>>();

	get size(): number {
		return this.#entries.size;
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
		return this.#entries.indexOf(entry as MutablePriorityListEntry<T>);
	}

	/**
	 * Appends with an automatically assigned priority.
	 *
	 * First automatic priority is 1.
	 * Every following automatic priority is the current last priority + 1.
	 */
	push(value: T): PriorityListEntry<T> {
		const priority = nextPriority(this.#entries.at(-1)?.priority);

		const entry: MutablePriorityListEntry<T> = {
			value,
			priority,
			index: -1
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
			index: -1
		};

		this.#entries.insert(index, entry);

		return entry;
	}

	setPriority(entry: PriorityListEntry<T>, priority: number): boolean {
		assertPriority(priority);

		const mutableEntry = entry as MutablePriorityListEntry<T>;
		const oldIndex = this.#entries.indexOf(mutableEntry);

		if (oldIndex === -1) {
			return false;
		}

		const oldPriority = mutableEntry.priority;

		if (oldPriority === priority) {
			return true;
		}

		let newIndex = this.#upperBound(priority);

		if (priority > oldPriority) {
			newIndex--;
		}

		if (!this.#entries.move(mutableEntry, newIndex)) {
			throw new Error('PriorityList internal entry invariant violated.');
		}

		mutableEntry.priority = priority;

		return true;
	}

	delete(entry: PriorityListEntry<T>): boolean {
		return this.#entries.delete(entry as MutablePriorityListEntry<T>);
	}

	pop(): T | undefined {
		return this.#entries.pop()?.value;
	}

	clear(): void {
		this.#entries.clear();
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
		return priorityUpperBound(this.size, (index) => this.#priorityAtRequired(index), priority);
	}

	#priorityAtRequired(index: number): number {
		const priority = this.priorityAt(index);

		if (priority === undefined) {
			throw new Error('PriorityList internal priority invariant violated.');
		}

		return priority;
	}
}
