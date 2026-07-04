import type { CommandInterface } from '../command';

export function createSimpleCommand(execute: () => void, undo: () => void): CommandInterface<boolean> {
	let wasExecuted = false;
	return {
		get executed() {
			return wasExecuted;
		},
		execute: () => {
			wasExecuted = true;
			execute();

			return true;
		},
		undo: () => {
			if (wasExecuted) {
				wasExecuted = false;
				undo();

				return true;
			}

			return false;
		}
	};
}
