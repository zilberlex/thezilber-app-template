import type { AsyncCommandInterface } from '../../../../../routes/async-command-stack/commands/async-command';
import type { PeristentCommand } from '../../../../../routes/async-command-stack/pipeline/pipeline-command';
import type { Command } from '../command';
import type { CommandRegistry } from '../persistency/commandRegistry';

export type PersistentCommandStack = {
	persistentCommandsUndo: Array<PeristentCommand<any>>;
	persistentCommandsRedo: Array<PeristentCommand<any>>;
};

export type CommandItem = Command | AsyncCommandInterface<any>;

export class CommandStack {
	#commandsUndo: Array<CommandItem> = [];
	#commandsRedo: Array<CommandItem> = [];

	push(command: CommandItem) {
		this.#commandsRedo = [];

		this.#commandsUndo.push(command);
	}

	async execute(command: CommandItem) {
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

	persistStack(): PersistentCommandStack {
		return {
			persistentCommandsUndo: this.#commandsUndo.map((x) => x.persistCommand()),
			persistentCommandsRedo: this.#commandsRedo.map((x) => x.persistCommand())
		};
	}

	hydrate(persistStack: PersistentCommandStack, commandRegistry: CommandRegistry) {
		this.#commandsUndo = this.#loadCommands(persistStack.persistentCommandsUndo, commandRegistry);
		this.#commandsRedo = this.#loadCommands(persistStack.persistentCommandsRedo, commandRegistry);
	}

	#loadCommands(persistentCommands: Array<PeristentCommand<any>>, commandRegistry: CommandRegistry) {
		return persistentCommands
			.map((x) => {
				let ret = commandRegistry.createCommand(x);

				if (!ret) {
					console.log('No persistent mapping for command type', x.commandType);
				}

				return ret;
			})
			.filter((x) => x !== undefined);
	}
}
