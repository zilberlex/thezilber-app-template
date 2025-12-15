export function saveState(key: string, object: unknown) {
	try {
		const jsonStr = JSON.stringify(object);
		window.localStorage.setItem(key, jsonStr);
	} catch {
		console.error('error at saving item to localStorage, key', key, 'value');
	}
}

export function loadState(key: string) {
	let item = window.localStorage.getItem(key);

	return item ? JSON.parse(item) : item;
}
