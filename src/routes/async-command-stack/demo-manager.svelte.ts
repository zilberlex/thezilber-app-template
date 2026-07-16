import { type CommandRegistry } from '$lib/engine/patterns/command/persistancy/command-registry';
import { SvelteMap } from 'svelte/reactivity';
import { DemoCommandFactory } from './app-actions/piplines/demo-command-factory';
import { appState } from '$lib/engine/state/application-state.svelte';
import type { ClearCtx, DeleteCtx, InsertCtx, UpdateCtx } from './app-actions/piplines/types';
import type { EngineLogger } from '$lib/engine/logging/engine-logger';

export class DemoManager {
	memoryStorage = new SvelteMap<string, string>();
	farAwayStorage = new SvelteMap<string, string>();

	commandRegistry: CommandRegistry;
	demoCommandFacotry: DemoCommandFactory;
	logger: EngineLogger;

	constructor(logger: EngineLogger, commandRegistry: CommandRegistry) {
		this.commandRegistry = commandRegistry;
		this.logger = logger;

		this.demoCommandFacotry = new DemoCommandFactory(this.commandRegistry, this.memoryStorage, this.farAwayStorage);
	}

	async insertItem(key: string, value: string) {
		try {
			let insertCtx = $state.snapshot<InsertCtx>({
				key: key,
				insertValue: value
			});

			let command = this.demoCommandFacotry.insertCommand(insertCtx);
			let commandResult = await appState.commandStack.executeAndPush(command);

			if (!commandResult.ok) {
				console.error(commandResult.error);
				this.logger.error(commandResult.error.message, {
					scope: 'Insert',
					error: commandResult.error
				});
			}

			console.log('Insert Command Result', commandResult);
		} catch {}
	}

	async updateItem(key: string, value: string) {
		let prevValue = this.memoryStorage.get(key);

		if (prevValue === value) return;

		let updateCtx = $state.snapshot<UpdateCtx>({
			key: key,
			undoValue: prevValue ?? 'NOValue',
			insertValue: value
		});

		let command = this.demoCommandFacotry.updateCommand(updateCtx);
		let commandResult = await appState.commandStack.executeAndPush(command);

		if (!commandResult.ok) {
			console.error(commandResult.error);
			this.logger?.error(commandResult.error.message, {
				scope: 'Update',
				error: commandResult.error
			});
		}

		console.log('Update Command Result', commandResult);
	}

	async deleteItem(key: string) {
		let originalValue = this.memoryStorage.get(key);

		if (originalValue === undefined) {
			this.logger?.warn(`No Such Key - [${key}]`, {
				scope: 'Delete'
			});

			return;
		}

		let deleteCtx = $state.snapshot<DeleteCtx>({
			key: key,
			originalValue
		});

		let command = this.demoCommandFacotry.deleteCommand(deleteCtx);
		let commandResult = await appState.commandStack.executeAndPush(command);

		if (!commandResult.ok) {
			console.error(commandResult.error);
			this.logger?.error(commandResult.error.message, {
				scope: 'Delete',
				error: commandResult.error
			});
		}

		console.log('Clear Command Result', commandResult);
	}

	async clearState() {
		let clearCtx = $state.snapshot<ClearCtx>({
			storageState: this.memoryStorage
		});

		let command = this.demoCommandFacotry.clearCommand(clearCtx);
		let commandResult = appState.commandStack.executeAndPush(command);

		console.log('Delete Command Result', commandResult);
	}
}
