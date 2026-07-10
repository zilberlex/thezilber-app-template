export function removeFromArray<T>(arr: Array<T>, item: T, traverse: 'forward' | 'reverse' = 'forward') {
	let index = -1;
	if (traverse === 'forward') {
		index = arr.indexOf(item);
	} else {
		index = arr.lastIndexOf(item);
	}

	if (index !== -1) {
		arr.splice(index, 1);
	}

	return item;
}

export function removeFromArrayLast<T>(arr: Array<T>, item: T) {
	return removeFromArray(arr, item, 'reverse');
}
