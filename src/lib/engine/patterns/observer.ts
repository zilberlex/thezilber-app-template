export type DispatchHandler<T> = (dispatchedObject: T) => void;

export interface Dispatcher<T> {
	register(handler: DispatchHandler<T>): void;
	unregister(handler: DispatchHandler<T>): boolean;
}

export class DispatcherImpl<T> {
	#handlers: Array<DispatchHandler<T>> = [];

	public register(handler: DispatchHandler<T>): void {
		let indexOfHandler = this.#handlers.indexOf(handler);

		if (indexOfHandler == -1) {
			this.#handlers.push(handler);
		}
	}

	public unregister(handler: DispatchHandler<T>): boolean {
		let indexOfHandler = this.#handlers.indexOf(handler);

		let wasRemoved = false;
		if (indexOfHandler != -1) {
			this.#handlers.splice(indexOfHandler, 1);
			wasRemoved = true;
		}

		return wasRemoved;
	}

	public signal(signalObject: T): void {
		console.debug(
			'signal dispatching to handler count:',
			this.#handlers.length,
			'signal',
			signalObject
		);

		this.#handlers.forEach((handler) => {
			console.debug('dispaching Singal', signalObject, 'to handler', handler.toString());
			try {
				handler(signalObject);
			} catch (error) {
				console.error('failed handling for handler', error);
			}
		});
	}
}
