export class AsyncSerialQueue {
	#tail = Promise.resolve();
	enqueue<T>(task: () => Promise<T>): Promise<T> {
		let newPromise = this.#tail.then(task, task);

		this.#tail = newPromise.then(
			() => undefined,
			() => undefined
		);

		return newPromise;
	}
}
