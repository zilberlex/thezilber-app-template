import type { Command } from '../command';

export function wrapAutoResetCommand(command: Command, timeoutMs: number): Command {
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
			if (command.executed) {
				command.undo();
			}
			wasExecuted = false;
		},
		get executed() {
			return command.executed;
		}
	};
}
