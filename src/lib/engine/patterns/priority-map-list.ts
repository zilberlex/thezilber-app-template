import { MapList } from './map-list';

export class PriorityMapList<K, V> extends MapList<K, V> {
	getPriority(key: K): number | undefined {
		return this.getPriorityForKey(key);
	}

	priorityAt(index: number): number | undefined {
		return this.getPriorityAt(index);
	}

	insert(key: K, value: V, priority: number): number {
		return this.insertWithPriority(key, value, priority);
	}

	setPriority(key: K, priority: number): boolean {
		return this.setPriorityForKey(key, priority);
	}
}
