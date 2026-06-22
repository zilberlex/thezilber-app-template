import type { AsyncUndoPattern } from './async-undo-pattern';
import type { UndoPattern } from './undo-pattern';

class AsyncCommand<CommandOutput> {
	#optimisticUndoPattern: UndoPattern<CommandOutput>;
	#asyncUndoPattern: AsyncUndoPattern<CommandOutput>;
	#executed: boolean = false;

	constructor(
		optimisticUndoPattern: UndoPattern<CommandOutput>,
		asyncUndoPattern: AsyncUndoPattern<CommandOutput>,
		stack?: any
	) {
		this.#optimisticUndoPattern = optimisticUndoPattern;
		this.#asyncUndoPattern = asyncUndoPattern;
	}

	async execute() {
		this.#optimisticUndoPattern.execute();

		let ret = await this.#asyncUndoPattern.executeAsync();

		this.#executed = true;

		return ret;
	}

	async undo() {
		console.log('Undoing Command');

		this.#optimisticUndoPattern.undo();

		let ret = await this.#asyncUndoPattern.undoAsync();
		this.#executed = false;

		return ret;
	}

	get executed() {
		return this.#executed;
	}
}

export function asyncCommand<R>(optimisticUndoPattern: UndoPattern<R>, asyncUndoPattern: AsyncUndoPattern<R>) {
	return new AsyncCommand(optimisticUndoPattern, asyncUndoPattern);
}

export function asyncCommandChain<I, O>(
	asyncCommand: AsyncCommand<I>,
	asyncUndoPattern: AsyncUndoPattern<I>
): AsyncCommand<O> {
	let chainedAsyncUndoPattern = {
		executeAsync: async () => {
			await asyncUndoPattern.executeAsync(await asyncCommand.execute());
		}
	};

	return asyncCommand(() => {});
}
