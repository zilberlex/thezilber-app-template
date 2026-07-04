import type { CommandRegistry } from '../pipeline/command-registry';
import { definePipelineSpecs, PipelineCommandFactory } from '../pipeline/pipeline-command-factory';
import { clearSteps, type ClearCtx } from './clear-pipeline';
import { deleteSteps, type DeleteCtx } from './delete-pipeline';
import { insertSteps, type InsertCtx } from './insert-pipline';
import type { DemoCommandDeps } from './pipeline-common';

const demoCommandSpecs = definePipelineSpecs<DemoCommandDeps>()({
	'demo-insert-command': {
		steps: insertSteps
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
		this.#factory = new PipelineCommandFactory(
			{
				memoryStorage,
				farAwayStorage
			},
			demoCommandSpecs
		);

		this.#factory.registerInto(commandRegistry);
	}

	insertCommand(ctx: InsertCtx) {
		return this.#factory.create('demo-insert-command', ctx);
	}

	deleteCommand(ctx: DeleteCtx) {
		return this.#factory.create('demo-delete-command', ctx);
	}

	clearCommand(ctx: ClearCtx) {
		return this.#factory.create('demo-clear-command', ctx);
	}
}
