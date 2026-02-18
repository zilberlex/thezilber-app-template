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

export function deepAssign<T extends AnyRecord>(
	target: T,
	...sources: Array<Partial<T> | null | undefined>
): T {
	for (const source of sources) {
		if (!source) continue;

		const keys: PropertyKey[] = [...Object.keys(source), ...Object.getOwnPropertySymbols(source)];

		for (const key of keys) {
			const sVal = (source as AnyRecord)[key];
			const tVal = (target as AnyRecord)[key];

			// In-place array replacement
			if (Array.isArray(tVal) && Array.isArray(sVal)) {
				replaceArrayInPlace(tVal, sVal);
			}
			// Recursive merge for plain objects
			else if (isPlainObject(tVal) && isPlainObject(sVal)) {
				(target as AnyRecord)[key] = deepAssign(tVal as AnyRecord, sVal as AnyRecord);
			}
			// Fallback: replace
			else {
				(target as AnyRecord)[key] = sVal;
			}
		}
	}

	return target;
}
