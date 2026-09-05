export type Binding<T> = {
	get value(): T;
	set value(value: T);
};

export function createStateBinding<T>(initialValue: T): Binding<T> {
	let value = $state(initialValue);

	return {
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		}
	};
}

export function externalBinding<T>(get: () => T, set: (value: T) => void): Binding<T> {
	return {
		get value() {
			return get();
		},
		set value(v) {
			set(v);
		}
	};
}
