import { MapList } from './map-list';
import { assertPriority, nextPriority, priorityUpperBound } from './priority-utils';

export class PriorityMapList<K, V> extends MapList<K, V> {
	#priorities = new Map<K, number>();

	getPriority(key: K): number | undefined {
		return this.#priorities.get(key);
	}

	priorityAt(index: number): number | undefined {
		const entry = this.entryAt(index);

		if (!entry) {
			return;
		}

		return this.#priorities.get(entry[0]);
	}

	insert(key: K, value: V, priority: number): number {
		assertPriority(priority);

		const index = this.#upperBound(priority);
		const size = this.insertAt(index, key, value);

		this.#priorities.set(key, priority);

		return size;
	}

	override push(key: K, value: V): number {
		const priority = nextPriority(this.size > 0 ? this.#priorityAtRequired(this.size - 1) : undefined);

		const size = super.push(key, value);

		this.#priorities.set(key, priority);

		return size;
	}

	override pop(): [K, V] | undefined {
		const entry = super.pop();

		if (!entry) {
			return;
		}

		this.#priorities.delete(entry[0]);

		return entry;
	}

	override delete(key: K): boolean {
		const deleted = super.delete(key);

		if (!deleted) {
			return false;
		}

		this.#priorities.delete(key);

		return true;
	}

	override clear(): void {
		super.clear();
		this.#priorities.clear();
	}

	setPriority(key: K, priority: number): boolean {
		assertPriority(priority);

		const oldPriority = this.#priorities.get(key);

		if (oldPriority === undefined) {
			return false;
		}

		if (oldPriority === priority) {
			return true;
		}

		let newIndex = this.#upperBound(priority);

		if (priority > oldPriority) {
			newIndex--;
		}

		if (!this.moveToIndex(key, newIndex)) {
			throw new Error('PriorityMapList internal entry invariant violated.');
		}

		this.#priorities.set(key, priority);

		return true;
	}

	#upperBound(priority: number): number {
		return priorityUpperBound(this.size, (index) => this.#priorityAtRequired(index), priority);
	}

	#priorityAtRequired(index: number): number {
		const priority = this.priorityAt(index);

		if (priority === undefined) {
			throw new Error('PriorityMapList internal priority invariant violated.');
		}

		return priority;
	}
}
