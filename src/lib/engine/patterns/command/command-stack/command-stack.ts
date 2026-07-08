import type { MaybePromise } from '$lib/engine/general-js-ts/typescript/type-helpers';
import type { Command } from '../command';
import type { CommandRegistry } from '../persistancy/command-registry';
import type { PersistedCommand } from '../persistancy/persistent-command';
import type { PersistableItem } from '../persistancy/persistent-item';

export type PersistedCommandStack = {
	persistedCommandsUndo: Array<PersistedCommand>;
	persistentCommandsRedo: Array<PersistedCommand>;
};

export type CommandItem = Command<MaybePromise<any>> & PersistableItem<any>;

export class CommandStack {
	#commandsUndo: Array<CommandItem> = [];
	#commandsRedo: Array<CommandItem> = [];

	async executeAndPush(command: CommandItem) {
		this.#commandsRedo = [];
		this.#commandsUndo.push(command);
		// todo az none happy flow handling.
		return await command.execute();
	}

	async undo() {
		let command = this.#commandsUndo.pop();
		if (command) {
			console.debug('undo command', command);
			this.#commandsRedo.push(command);
			return await command.undo();
		}
	}

	async redo() {
		let command = this.#commandsRedo.pop();
		if (command) {
			this.#commandsUndo.push(command);
			return await command.execute();
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
