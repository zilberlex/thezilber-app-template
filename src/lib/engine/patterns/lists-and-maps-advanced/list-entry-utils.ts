export interface IndexedEntry {
	index: number;
}

export function repairEntryIndexes<T extends IndexedEntry>(
	entries: T[],
	start: number,
	end = entries.length - 1
): void {
	for (let index = start; index <= end; index++) {
		entries[index].index = index;
	}
}

export function ownsEntry<T extends IndexedEntry>(entries: readonly T[], entry: T): boolean {
	const index = entry.index;

	return Number.isInteger(index) && index >= 0 && index < entries.length && entries[index] === entry;
}
