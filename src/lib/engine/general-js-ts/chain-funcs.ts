export type Fn<Args extends unknown[], T> = (...args: Args) => T;

export function chain<Args extends unknown[], T>(
	reducer: (results: T[]) => T,
	...fns: Fn<Args, T>[]
): Fn<Args, T> {
	return (...args) => reducer(fns.map((fn) => fn(...args)));
}
