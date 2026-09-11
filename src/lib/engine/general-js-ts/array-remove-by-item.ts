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

export function removeFromArrayPredicate<T>(arr: Array<T>, predicate: (item: T) => boolean) {
	const index = arr.findIndex(predicate);

	let item = undefined;

	if (index > -1) {
		item = arr[index];
		arr.splice(index, 1); // Removes 1 item at that index
	}

	return item;
}
