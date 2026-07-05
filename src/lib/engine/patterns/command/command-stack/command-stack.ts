import type { AsyncCommandInterface } from '../async-command';
import type { CommandRegistry } from '../persistancy/command-registry';
import type { PersistedCommand } from '../persistancy/persistent-command';
import type { PersistableItem } from '../persistancy/persistent-item';

export type PersistedCommandStack = {
	persistedCommandsUndo: Array<PersistedCommand>;
	persistentCommandsRedo: Array<PersistedCommand>;
};

export type CommandItem = AsyncCommandInterface<any> & PersistableItem<any>;

export class CommandStack {
	#commandsUndo: Array<CommandItem> = [];
	#commandsRedo: Array<CommandItem> = [];

	push(command: CommandItem) {
		this.#commandsRedo = [];

		this.#commandsUndo.push(command);
	}

	async execute(command: CommandItem) {
		throw Error('implement');
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

	persistStack(): PersistedCommandStack {
		return {
			persistedCommandsUndo: this.#commandsUndo.map((x) => x.persist()),
			persistentCommandsRedo: this.#commandsRedo.map((x) => x.persist())
		};
	}

	hydrate(persistStack: PersistedCommandStack, commandRegistry: CommandRegistry) {
		this.#commandsUndo = this.#loadCommands(persistStack.persistedCommandsUndo, commandRegistry);
		this.#commandsRedo = this.#loadCommands(persistStack.persistentCommandsRedo, commandRegistry);
	}

	#loadCommands(persistentCommands: Array<PersistedCommand<any>>, commandRegistry: CommandRegistry) {
		return persistentCommands
			.map((x) => {
				let ret = commandRegistry.create(x);

				if (!ret) {
					console.log('No persistent mapping for command type', x.itemType);
				}

				return ret;
			})
			.filter((x) => x !== undefined);
	}
}
