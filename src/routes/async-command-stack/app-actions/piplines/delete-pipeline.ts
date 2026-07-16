import { sleep } from '$lib/engine/general-js-ts/common';
import type { PipelineSteps } from '$lib/engine/patterns/command/pipeline/types';
import { errorResult } from '$lib/engine/patterns/result/common';
import { pipelineStep } from '../../../../lib/engine/patterns/command/pipeline/pipeline-step';
import type { DeleteCtx, DemoCommandDeps } from './types';

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

const optimisticDeletePipelineStep = pipelineStep<DemoCommandDeps, DeleteCtx>(
	(deps, ctx) => {
		let { key } = ctx;
		let { memoryStorage } = deps;

		memoryStorage.delete(key);
	},
	(deps, ctx) => {
		let { key, originalValue } = ctx;
		let { memoryStorage } = deps;

		if (originalValue === undefined) {
			memoryStorage.delete(key);
		} else {
			memoryStorage.set(key, originalValue);
		}
	}
);

const deleteAsyncPiplineStep = pipelineStep<DemoCommandDeps, DeleteCtx, string>(
	async (deps, ctx) => {
		let { farAwayStorageAsyncSerialQueue } = deps;

		return await farAwayStorageAsyncSerialQueue.enqueue(async () => {
			let { key, originalValue } = ctx;
			let { farAwayStorage } = deps;

			await sleep(1000);
			let deleted = farAwayStorage.delete(key);
			if (!deleted) {
				return errorResult(new Error(`Key Does not Exist: [${key}]`));
			}

			let retVal = `Deleted [${key}] Value: [${originalValue}]`;

			return retVal;
		});
	},
	async (deps, ctx) => {
		let { farAwayStorageAsyncSerialQueue } = deps;

		return await farAwayStorageAsyncSerialQueue.enqueue(async () => {
			let { key, originalValue } = ctx;
			let { farAwayStorage } = deps;

			farAwayStorage.set(key, originalValue);
			await sleep(1000);

			let retVal = `Deleted [${key}] Value: [${originalValue}]`;

			return retVal;
		});
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

export const deleteSteps = [
	startingStep,
	optimisticDeletePipelineStep,
	deleteAsyncPiplineStep,
	endStep
] satisfies PipelineSteps<DemoCommandDeps, DeleteCtx>;
