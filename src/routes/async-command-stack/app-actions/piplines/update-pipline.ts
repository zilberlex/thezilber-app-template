import { sleep } from '@svelte-ascend/core';
import type { PipelineSteps } from '@svelte-ascend/core';
import { errorResult } from '@svelte-ascend/core';
import { pipelineStep } from '@svelte-ascend/core';
import type { DemoCommandDeps, UpdateCtx } from './types';

const startingStep = pipelineStep(
	(_deps: DemoCommandDeps, ctx: UpdateCtx) => {
		console.log('Inserting Item', ctx);
	},
	(_deps: DemoCommandDeps, ctx: UpdateCtx) => {
		console.log('Undoing Item', ctx);
	},
	(_deps: DemoCommandDeps, ctx: UpdateCtx) => {
		console.log('Update Failed', ctx);
	},
	(_deps: DemoCommandDeps, ctx: UpdateCtx) => {
		console.log('Undo Update Failed', ctx);
	}
);

const endStep = pipelineStep(
	(_deps: DemoCommandDeps, ctx: UpdateCtx) => {
		console.log('Successfully Inserted Item', ctx);
	},
	(_deps: DemoCommandDeps, ctx: UpdateCtx) => {
		console.log('Successfully Undone Insertion', ctx);
	}
);

const optimisticUpdatePipelineStep = pipelineStep<DemoCommandDeps, UpdateCtx>(
	(deps, ctx) => {
		const { key, insertValue } = ctx;
		const { memoryStorage } = deps;

		if (!memoryStorage.has(key)) {
			return errorResult(new Error(`Key does not exist: [${key}]`));
		}

		memoryStorage.set(key, insertValue);
	},
	(deps, ctx) => {
		const { undoValue, key } = ctx;
		const { memoryStorage } = deps;

		if (undoValue === undefined) {
			memoryStorage.delete(key);
		} else {
			memoryStorage.set(key, undoValue);
		}
	}
);

const updateAsyncPiplineStep = pipelineStep<DemoCommandDeps, UpdateCtx, string>(
	async (deps, ctx) => {
		let { farAwayStorageAsyncSerialQueue } = deps;

		return await farAwayStorageAsyncSerialQueue.enqueue(async () => {
			const { key, insertValue } = ctx;
			const { farAwayStorage } = deps;

			await sleep(1000);
			if (!farAwayStorage.has(key)) {
				return errorResult(new Error(`Key does not exist: [${key}]`));
			}

			farAwayStorage.set(key, insertValue);

			return `Inserted [${key}, ${insertValue}]`;
		});
	},
	async (deps, ctx) => {
		let { farAwayStorageAsyncSerialQueue } = deps;

		return await farAwayStorageAsyncSerialQueue.enqueue(async () => {
			const { key, undoValue, insertValue } = ctx;
			const { farAwayStorage } = deps;

			await sleep(1000);

			if (undoValue === undefined) {
				farAwayStorage.delete(key);
			} else {
				farAwayStorage.set(key, undoValue);
			}

			return `Undone Update key: [${key}], value: [${insertValue}] -> [${undoValue}]`;
		});
	}
);

export const updateSteps = [
	startingStep,
	optimisticUpdatePipelineStep,
	updateAsyncPiplineStep,
	endStep
] satisfies PipelineSteps<DemoCommandDeps, UpdateCtx>;
