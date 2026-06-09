type AnyRecord = Record<PropertyKey, unknown>;

function isPlainObject(value: unknown): value is Record<string | symbol, unknown> {
	if (value === null || typeof value !== 'object') return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

function replaceArrayInPlace(target: unknown[], source: unknown[]) {
	target.length = 0;
	target.push(...source);
}

function get(obj: object, key: PropertyKey): unknown {
	return (obj as Record<PropertyKey, unknown>)[key];
}

function set(obj: object, key: PropertyKey, value: unknown) {
	(obj as Record<PropertyKey, unknown>)[key] = value;
}

export function deepAssign<T extends object>(target: T, ...sources: Array<Partial<T> | null | undefined>): T {
	for (const source of sources) {
		if (!source) continue;

		const keys: PropertyKey[] = [...Object.keys(source), ...Object.getOwnPropertySymbols(source)];

		for (const key of keys) {
			const sVal = get(source, key);
			const tVal = get(target, key);

			if (Array.isArray(tVal) && Array.isArray(sVal)) {
				replaceArrayInPlace(tVal, sVal);
			} else if (isPlainObject(tVal) && isPlainObject(sVal)) {
				set(target, key, deepAssign(tVal, sVal));
			} else {
				set(target, key, sVal);
			}
		}
	}

	return target;
}
