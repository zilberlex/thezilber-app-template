export class ActionQueue {
	#actionsQueue = new Array<() => void>();
	#frozen = false;

	freeze() {
		this.#frozen = true;
	}

	unfreeze() {
		if (!this.#frozen) return;

		this.#frozen = false;

		const actions = this.#actionsQueue.splice(0);

		actions.forEach((action) => {
			try {
				action();
			} catch (e) {
				console.error(e);
			}
		});
	}

	queueAction(action: () => void) {
		if (!this.#frozen) {
			action();
		} else {
			this.#actionsQueue.push(action);
		}
	}
}
