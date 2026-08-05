export type DispatchHandler<T> = (dispatchedObject: T) => void;

export interface Dispatcher<T> {
	register(handler: DispatchHandler<T>): () => void;
	unregister(handler: DispatchHandler<T>): void;
}

export class DispatcherImpl<T> {
	#handlers: Array<DispatchHandler<T>> = [];

	public register(handler: DispatchHandler<T>): () => void {
		let indexOfHandler = this.#handlers.indexOf(handler);

		if (indexOfHandler == -1) {
			this.#handlers.push(handler);
		}

		return () => this.unregister(handler);
	}

	public unregister(handler: DispatchHandler<T>): void {
		let indexOfHandler = this.#handlers.indexOf(handler);

		if (indexOfHandler === -1) throw Error(`Handler Not Found ${handler.toString()}`);

		this.#handlers.splice(indexOfHandler, 1);
	}

	public signal(signalObject: T): void {
		this.#handlers.forEach((handler) => {
			try {
				handler(signalObject);
			} catch (error) {
				console.error('failed handling for handler', error);
			}
		});
	}
}
