export function saveLocalStorage(key: string, object: unknown) {
	try {
		const jsonStr = JSON.stringify(object);
		window.localStorage.setItem(key, jsonStr);
	} catch {
		console.error('error at saving item to localStorage, key', key, 'value');
	}
}

export function loadLocalStorage(key: string) {
	let item = window.localStorage.getItem(key);

	return item ? JSON.parse(item) : item;
}

export function removeLocalStorage(key: string) {
	window.localStorage.removeItem(key);
}
