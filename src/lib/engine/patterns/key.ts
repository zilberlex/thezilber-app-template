export type PrimitiveKey = string | number | boolean | symbol | bigint;
export type KeyLike = { toKey(): string };

export function isKeyLike(key: KeyLike | PrimitiveKey): key is KeyLike {
	return (
		typeof key === 'object' &&
		key !== null &&
		'toKey' in key &&
		typeof (key as any).toKey === 'function'
	);
}
