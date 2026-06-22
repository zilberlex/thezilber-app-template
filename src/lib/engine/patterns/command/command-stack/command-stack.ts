import type { AsyncCommandInterface } from '../../../../../routes/async-command-stack/commands/async-command';
import type { Command } from '../command';

export class CommandStack {
	#commandsUndo: Array<Command | AsyncCommandInterface<any>> = [];
	#commandsRedo: Array<Command | AsyncCommandInterface<any>> = [];

	push(command: Command | AsyncCommandInterface<any>) {
		this.#commandsRedo = [];

		this.#commandsUndo.push(command);
	}

	async execute(command: Command) {
		command.execute();
		this.push(command);
	}

	async undo() {
		let command = this.#commandsUndo.pop();
		if (command) {
			console.debug('undo command', command);
			await Promise.resolve(command.undo());
			this.#commandsRedo.push(command);
		}
	}

	async redo() {
		let command = this.#commandsRedo.pop();
		if (command) {
			await Promise.resolve(command.execute());
			this.#commandsUndo.push(command);
		}
	}
}
