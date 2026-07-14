import { removeFromArrayLast } from '$lib/engine/general-js-ts/arrayRemoveByItem';
import type { MaybePromise } from '$lib/engine/general-js-ts/typescript/type-helpers';
import { isErrorResult } from '$lib/engine/patterns/result/common';
import type { MaybeResult } from '$lib/engine/patterns/result/types';
import type { Command } from '../command';
import type { CommandRegistry } from '../persistancy/command-registry';
import type { PersistedCommand } from '../persistancy/persistent-command';
import type { PersistableItem } from '../persistancy/persistent-item';

// TODO AZ make nonhappyflow look up not O(n)
// TODO AZ make command stack of limited size
export type PersistedCommandStack = {
	persistedCommandsUndo: Array<PersistedCommand>;
	persistentCommandsRedo: Array<PersistedCommand>;
};

type CommandReturn<T, E extends Error> = MaybePromise<MaybeResult<T, E>>;

export type CommandItem<T, E extends Error = Error> = Command<CommandReturn<T, E>> & PersistableItem<any>;

export class CommandStack {
	#commandsUndo: Array<CommandItem<unknown>> = [];
	#commandsRedo: Array<CommandItem<unknown>> = [];

	// This has Error Handling while others don't because i assume any -
	// 1. errors fixed at this stage are consistent errors
	// 2. Errors during undo/redo will be recoverable. so i rather keep them on stack
	// This may be not a best way to do things, but assuming I don't encounter errors in the future
	// the comment will remain, and the api would prove itself stable enough
	async executeAndPush<T, E extends Error>(command: CommandItem<T, E>) {
		this.#commandsRedo = [];
		this.#commandsUndo.push(command);
		// todo az none happy flow handling.

		try {
			const result = await command.execute();

			if (isErrorResult(result)) {
				this.#removeCommand(command, 'execute');
			}

			return result;
		} catch (e) {
			this.#removeCommand(command, 'execute');
			throw e;
		}
	}

	async undo() {
		let command = this.#commandsUndo.pop();
		if (command) {
			this.#commandsRedo.push(command);

			const result = await command.undo();

			return result;
		}
	}

	async redo() {
		let command = this.#commandsRedo.pop();
		if (command) {
			this.#commandsUndo.push(command);
			const result = await command.execute();

			return result;
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

	#removeCommand(command: CommandItem<unknown>, type: 'execute' | 'undo' | 'redo') {
		let op = 'Execute';
		switch (type) {
			case 'undo':
				op = 'Undo';
				break;
			case 'redo':
				op = 'Redo';
				break;
		}
		console.warn(`[Command Stack ${op}] command Execution threw an error, removing from stack`);
		removeFromArrayLast(this.#commandsUndo, command);
		removeFromArrayLast(this.#commandsRedo, command);
	}
}
