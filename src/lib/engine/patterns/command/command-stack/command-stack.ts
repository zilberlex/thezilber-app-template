import type { Command } from '../command';

export class CommandStack {
	#commandsUndo: Command[] = [];
	#commandsRedo: Command[] = [];

	push(command: Command) {
		this.#commandsRedo = [];

		this.#commandsUndo.push(command);
	}

	execute(command: Command) {
		command.execute();
		this.push(command);
	}

	undo() {
		let command = this.#commandsUndo.pop();
		if (command) {
			console.debug('undo command', command);
			command.undo();
			this.#commandsRedo.push(command);
		}
	}

	redo() {
		let command = this.#commandsRedo.pop();
		if (command) {
			command.execute();
			this.#commandsUndo.push(command);
		}
	}
}
