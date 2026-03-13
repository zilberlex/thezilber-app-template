export function saveLocalStorage<T>(key: string, object: T): T {
	const jsonStr = JSON.stringify(object);
	window.localStorage.setItem(key, jsonStr);

	return object;
}

export function loadLocalStorage(key: string) {
	let item = window.localStorage.getItem(key);

	return item ? JSON.parse(item) : item;
}

export function removeLocalStorage(key: string) {
	window.localStorage.removeItem(key);
}
