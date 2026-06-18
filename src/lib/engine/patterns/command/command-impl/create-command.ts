import type { Command } from '../command';

export function createCommand(execute: () => void, undo: () => void): Command {
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
			}
		}
	};
}
