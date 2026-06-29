import { sleep } from '$lib/engine/general-js-ts/common';
import { pipelineCommand } from '../pipeline/pipeline-command';
import { pipelineStep } from '../pipeline/pipeline-step';
import type { DemoCommandDeps, DemoCommandType } from './demo-command-factory';

export type DeleteCtx = {
	key: string;
	originalValue: string;
};

const startingStep = pipelineStep<DemoCommandDeps, DeleteCtx>(
	(_deps, ctx) => {
		console.log('Deleting Item', ctx);
	},
	(_deps, ctx) => {
		console.log('Undoing Delete Item', ctx);
	},
	(_deps, ctx) => {
		console.log('Delete Failed', ctx);
	},
	(_deps, ctx) => {
		console.log('UndoDelete Failed', ctx);
	}
);

const optimisticDeletePipelineStep = pipelineStep(
	(deps: DemoCommandDeps, ctx: DeleteCtx) => {
		let { key } = ctx;
		let { memoryStorage } = deps;

		memoryStorage.delete(key);
	},
	(deps: DemoCommandDeps, ctx: DeleteCtx) => {
		let { key, originalValue } = ctx;
		let { memoryStorage } = deps;

		if (originalValue === undefined) {
			memoryStorage.delete(key);
		} else {
			memoryStorage.set(key, originalValue);
		}
	}
);

const deleteAsyncPiplineStep = pipelineStep(
	async (deps: DemoCommandDeps, ctx: DeleteCtx) => {
		let { key, originalValue } = ctx;
		let { farAwayStorage } = deps;

		if (originalValue === undefined) {
			return undefined;
		}

		await sleep(1000);
		farAwayStorage.delete(key);

		let retVal = `Deleted [${key}] Value: [${originalValue}]`;

		return retVal;
	},
	async (deps: DemoCommandDeps, ctx: DeleteCtx) => {
		let { key, originalValue } = ctx;
		let { farAwayStorage } = deps;

		// simulate async

		if (originalValue === undefined) {
			return undefined;
		}

		farAwayStorage.set(key, originalValue);
		await sleep(1000);

		let retVal = `Deleted [${key}] Value: [${originalValue}]`;

		return retVal;
	}
);

const endStep = pipelineStep<DemoCommandDeps, DeleteCtx>(
	(_deps, ctx) => {
		console.log('Successfully deleted', ctx);
	},

	(_deps, ctx) => {
		console.log('Undone Delete', ctx);
	}
);

export function constructDeletePipelineCommand(
	commandType: DemoCommandType,
	memoryStorage: Map<string, string>,
	farAwayStorage: Map<string, string>,
	deleteCtx: DeleteCtx
) {
	let command = pipelineCommand(
		commandType,
		{
			memoryStorage,
			farAwayStorage
		},
		deleteCtx,
		[startingStep, optimisticDeletePipelineStep, deleteAsyncPiplineStep, endStep]
	);

	return command;
}
