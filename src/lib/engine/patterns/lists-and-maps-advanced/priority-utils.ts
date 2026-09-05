export function assertPriority(priority: number): void {
	if (!Number.isFinite(priority)) {
		throw new RangeError('Priority must be a finite number.');
	}
}

export function nextPriority(lastPriority: number | undefined): number {
	if (lastPriority === undefined) {
		return 1;
	}

	const priority = lastPriority + 1;

	if (!Number.isFinite(priority) || priority <= lastPriority) {
		throw new RangeError('Unable to allocate the next automatic priority.');
	}

	return priority;
}

export function priorityUpperBound(size: number, priorityAt: (index: number) => number, priority: number): number {
	let low = 0;
	let high = size;

	while (low < high) {
		const middle = Math.floor((low + high) / 2);

		if (priorityAt(middle) <= priority) {
			low = middle + 1;
		} else {
			high = middle;
		}
	}

	return low;
}
