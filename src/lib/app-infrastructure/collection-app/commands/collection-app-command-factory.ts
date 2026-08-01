import { AsyncSerialQueue } from '$lib/engine/patterns/async-serial-queue';
import type { CommandRegistry } from '$lib/engine/patterns/command/persistancy/command-registry';
import {
	definePipelineSpecs,
	PipelineCommandFactory
} from '$lib/engine/patterns/command/pipeline/pipeline-command-factory';
import { insertSteps } from './insert-pipeline';
import type { CollectionAppCommandDeps } from './types';

const CollectionAppCommandSpecs = definePipelineSpecs<CollectionAppCommandDeps>()({
	'collection-app-insert-command': {
		steps: insertSteps
	}
});

export type CollectionAppCommandType = keyof typeof CollectionAppCommandSpecs;

export class CollectionAppCommandFactory {
	#factory: PipelineCommandFactory<CollectionAppCommandDeps, typeof CollectionAppCommandSpecs>;

	constructor(
		commandRegistry: CommandRegistry,
		memoryStorage: Map<string, string>,
		farAwayStorage: Map<string, string>
	) {
		let serialQueue = new AsyncSerialQueue();
		this.#factory = new PipelineCommandFactory(
			{
				memoryStorage,
				farAwayStorage,
				farAwayStorageAsyncSerialQueue: serialQueue
			},
			CollectionAppCommandSpecs
		);

		this.#factory.registerInto(commandRegistry);
	}

	insertCommand(ctx: InsertCtx) {
		return this.#factory.create('demo-insert-command', ctx);
	}

// 	updateCommand(ctx: UpdateCtx) {
// 		return this.#factory.create('demo-update-command', ctx);
// 	}
//
// 	deleteCommand(ctx: DeleteCtx) {
// 		return this.#factory.create('demo-delete-command', ctx);
// 	}
//
// 	clearCommand(ctx: ClearCtx) {
// 		return this.#factory.create('demo-clear-command', ctx);
// 	}
// }
