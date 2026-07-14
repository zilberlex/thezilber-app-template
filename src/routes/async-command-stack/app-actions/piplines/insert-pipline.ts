import { sleep } from '$lib/engine/general-js-ts/common';
import type { PipelineSteps } from '$lib/engine/patterns/command/pipeline/types';
import { errorResult } from '$lib/engine/patterns/result/common';
import { pipelineStep } from '../../../../lib/engine/patterns/command/pipeline/pipeline-step';
import type { DemoCommandDeps, InsertCtx } from './types';

const startingStep = pipelineStep<DemoCommandDeps, InsertCtx>(
	(_deps, ctx) => {
		console.log('Inserting Item', ctx);
	},
	(_deps, ctx) => {
		console.log('Undoing Item', ctx);
	},
	(_deps, ctx, e) => {
		console.error('Insert Failed', {
			ctx,
			error: e
		});
	},
	(_deps, ctx, e) => {
		console.error('Insert Undo Failed', {
			ctx,
			error: e
		});
	}
);

const endStep = pipelineStep(
	(_deps: DemoCommandDeps, ctx: InsertCtx) => {
		console.log('Successfully Inserted Item', ctx);
	},
	(_deps: DemoCommandDeps, ctx: InsertCtx) => {
		console.log('Successfully Undone Insertion', ctx);
	}
);

const optimisticInsertpipelinestep = pipelineStep<DemoCommandDeps, InsertCtx>(
	(deps, ctx) => {
		const { key, insertValue } = ctx;
		const { memoryStorage } = deps;

		if (memoryStorage.has(key)) {
			return errorResult(new Error(`Key Already Exists: [${key}]`));
		}

		memoryStorage.set(key, insertValue);
	},
	(deps, ctx) => {
		const { insertValue, key } = ctx;
		const { memoryStorage } = deps;

		const currentValue = memoryStorage.get(key);
		if (currentValue !== insertValue) {
			return errorResult(
				new Error(`Expected Value for key [${key}] to be [${insertValue}], but was: [${currentValue}]`)
			);
		}

		memoryStorage.delete(key);
	}
);

const insertAsyncPiplineStep = pipelineStep<DemoCommandDeps, InsertCtx, string>(
	async (deps, ctx) => {
		let { farAwayStorageAsyncSerialQueue } = deps;

		return await farAwayStorageAsyncSerialQueue.enqueue(async () => {
			const { key, insertValue } = ctx;
			const { farAwayStorage } = deps;

			await sleep(1000);
			if (farAwayStorage.has(key)) {
				return errorResult(new Error(`Key already exists: [${key}]`));
			}

			farAwayStorage.set(key, insertValue);

			return `Inserted [${key}, ${insertValue}]`;
		});
	},
	async (deps, ctx) => {
		let { farAwayStorageAsyncSerialQueue } = deps;

		return await farAwayStorageAsyncSerialQueue.enqueue(async () => {
			const { key, insertValue } = ctx;
			const { farAwayStorage } = deps;

			await sleep(1000);

			const currentValue = farAwayStorage.get(key);
			if (currentValue !== insertValue) {
				return errorResult(
					new Error(`Expected Value for key [${key}] to be [${insertValue}], but was: [${currentValue}]`)
				);
			}

			farAwayStorage.delete(key);

			return `Undone Insertion, deleting - [${key}]`;
		});
	}
);

export const insertSteps = [
	startingStep,
	optimisticInsertpipelinestep,
	insertAsyncPiplineStep,
	endStep
] satisfies PipelineSteps<DemoCommandDeps, InsertCtx>;
