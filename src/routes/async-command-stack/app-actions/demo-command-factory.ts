import type { CommandRegistry } from '$lib/engine/patterns/command/persistency/commandRegistry';
import type { PeristentCommand } from '../pipeline/pipeline-command';
import { constructDeletePipelineCommand, type DeleteCtx } from './delete-pipeline';
import { constructInsertPipelineCommand, type InsertCtx } from './insert-pipline';

type PersistentCommandOf<CommandType extends string, Ctx> = Omit<PeristentCommand<Ctx>, 'commandType'> & {
	commandType: CommandType;
};

export type DemoCommandDeps = {
	memoryStorage: Map<string, string>;
	farAwayStorage: Map<string, string>;
};

function definePersistantCommandHandlers<
	const T extends Record<string, (deps: DemoCommandDeps, persistentCommand: any) => any>
>(handlers: T) {
	return handlers;
}

const persitentCommandHandlers = definePersistantCommandHandlers({
	'demo-insert-command': (
		deps: DemoCommandDeps,
		persistentCommand: PersistentCommandOf<'demo-insert-command', InsertCtx>
	) => {
		const command = constructInsertPipelineCommand(
			'demo-insert-command',
			deps.memoryStorage,
			deps.farAwayStorage,
			persistentCommand.baseCtx
		);

		command.hydrateCommand(persistentCommand);

		return command;
	},
	'demo-delete-command': (
		deps: DemoCommandDeps,
		persistentCommand: PersistentCommandOf<'demo-delete-command', DeleteCtx>
	) => {}
});

export type DemoCommandType = keyof typeof persitentCommandHandlers;

type DemoPersistentCommand<K extends DemoCommandType = DemoCommandType> = {
	[T in K]: Parameters<(typeof persitentCommandHandlers)[T]>[1];
}[K];

function typedKeys<T extends object>(obj: T) {
	return Object.keys(obj) as Array<keyof T>;
}

export class DemoCommandFactory {
	#commandRegistry: CommandRegistry;
	#farAwayStorage: Map<string, string>;
	#memoryStorage: Map<string, string>;

	constructor(
		commandRegistry: CommandRegistry,
		memoryStorage: Map<string, string>,
		farAwayStorage: Map<string, string>
	) {
		this.#commandRegistry = commandRegistry;
		this.#memoryStorage = memoryStorage;
		this.#farAwayStorage = farAwayStorage;

		for (const commandType of typedKeys(persitentCommandHandlers)) {
			this.#commandRegistry.register(commandType, (persistentCommand) =>
				this.fromPersistentCommand(persistentCommand as DemoPersistentCommand<typeof commandType>)
			);
		}
	}

	insertCommand(ctx: InsertCtx) {
		return constructInsertPipelineCommand('demo-insert-command', this.#memoryStorage, this.#farAwayStorage, ctx);
	}

	deleteCommand(ctx: DeleteCtx) {
		return constructDeletePipelineCommand('demo-delete-command', this.#memoryStorage, this.#farAwayStorage, ctx);
	}

	#deps(): DemoCommandDeps {
		return {
			memoryStorage: this.#memoryStorage,
			farAwayStorage: this.#farAwayStorage
		};
	}

	fromPersistentCommand<K extends DemoCommandType>(persistentCommand: DemoPersistentCommand<K>) {
		const handler = persitentCommandHandlers[persistentCommand.commandType];

		return handler(this.#deps(), persistentCommand);
	}
}
