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

export type CommandItem<T, E extends Error = Error> = Command<MaybePromise<MaybeResult<T, E>>> & PersistableItem<any>;

export class CommandStack {
	#commandsUndo: Array<CommandItem<unknown>> = [];
	#commandsRedo: Array<CommandItem<unknown>> = [];

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
			case 'redo':
				op = 'Redo';
		}
		console.warn(`[Command Stack ${op}] command Execution threw an error, removing from stack`);
		removeFromArrayLast(this.#commandsUndo, command);
		removeFromArrayLast(this.#commandsRedo, command);
	}
}
