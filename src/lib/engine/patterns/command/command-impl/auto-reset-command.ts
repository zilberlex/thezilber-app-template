import type { Command } from '../command';

export function wrapAutoResetCommand(command: Command<boolean>, timeoutMs: number): Command<boolean> {
	let timeout: number;
	let wasExecuted: boolean;
	return {
		execute: () => {
			wasExecuted = command.execute();

			// Reset Undo Timeout
			if (command.executed) {
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					command.undo();
				}, timeoutMs);
			}

			return wasExecuted;
		},
		undo: () => {
			clearTimeout(timeout);
			let ret = false;
			if (command.executed) {
				ret = command.undo();
			}
			wasExecuted = false;
			return ret;
		},
		get executed() {
			return command.executed;
		}
	};
}
