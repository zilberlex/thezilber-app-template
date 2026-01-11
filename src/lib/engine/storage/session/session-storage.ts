export function loadSessionStorage<T>(key: string): T | null {
	const item = sessionStorage.getItem(key);

	return item ? (JSON.parse(item) as T) : null;
}

export function saveSessionStorage<T>(key: string, value: T) {
	let objectStr = JSON.stringify(value);
	sessionStorage.setItem(key, objectStr);
}

export function clearSessionStorage(key: string) {
	sessionStorage.removeItem(key);
}
