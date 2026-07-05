export type RegistryHandler<Input, Output> = (input: Input) => Output;

export class Registry<Input, Output, Key extends string = string> {
	#handlers = new Map<Key, RegistryHandler<any, Output>>();

	constructor(private getKey: (input: Input) => Key) {}

	register<SpecificInput extends Input>(key: Key, handler: RegistryHandler<SpecificInput, Output>) {
		this.#handlers.set(key, handler as RegistryHandler<Input, Output>);
	}

	create(input: Input): Output | undefined {
		const key = this.getKey(input);
		const handler = this.#handlers.get(key);

		if (!handler) return;

		return handler(input);
	}
}
