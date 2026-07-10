import { AsyncSerialQueue } from '$lib/engine/patterns/async-serial-queue';
import type { CommandRegistry } from '$lib/engine/patterns/command/persistancy/command-registry';
import {
	definePipelineSpecs,
	PipelineCommandFactory
} from '$lib/engine/patterns/command/pipeline/pipeline-command-factory';
import { clearSteps } from './clear-pipeline';
import { deleteSteps } from './delete-pipeline';
import { insertSteps } from './insert-pipline';
import type { ClearCtx, DeleteCtx, DemoCommandDeps, InsertCtx, UpdateCtx } from './types';
import { updateSteps } from './update-pipline';

const demoCommandSpecs = definePipelineSpecs<DemoCommandDeps>()({
	'demo-insert-command': {
		steps: insertSteps
	},
	'demo-update-command': {
		steps: updateSteps
	},
	'demo-delete-command': {
		steps: deleteSteps
	},
	'demo-clear-command': {
		steps: clearSteps
	}
});

export type DemoCommandType = keyof typeof demoCommandSpecs;

export class DemoCommandFactory {
	#factory: PipelineCommandFactory<DemoCommandDeps, typeof demoCommandSpecs>;

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
			demoCommandSpecs
		);

		this.#factory.registerInto(commandRegistry);
	}

	insertCommand(ctx: InsertCtx) {
		return this.#factory.create('demo-insert-command', ctx);
	}

	updateCommand(ctx: UpdateCtx) {
		return this.#factory.create('demo-update-command', ctx);
	}

	deleteCommand(ctx: DeleteCtx) {
		return this.#factory.create('demo-delete-command', ctx);
	}

	clearCommand(ctx: ClearCtx) {
		return this.#factory.create('demo-clear-command', ctx);
	}
}
