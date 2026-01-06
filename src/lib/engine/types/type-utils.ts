type Ctor<T = any> = abstract new (...args: any[]) => T;

export function safeInstanceOf<Ctors extends readonly Ctor[]>(
	value: unknown,
	...ctors: Ctors
): InstanceType<Ctors[number]> | null {
	for (const ctor of ctors) {
		if (value instanceof ctor) {
			return value as InstanceType<Ctors[number]>;
		}
	}
	return null;
}
