import { sleep } from '$lib/engine/general-js-ts/common';
import type { PipelineSteps } from '../../../../lib/engine/patterns/command/pipeline/pipeline-command';
import { pipelineStep } from '../../../../lib/engine/patterns/command/pipeline/pipeline-step';
import type { DemoCommandDeps, InsertCtx } from './types';

const startingStep = pipelineStep(
	(_deps: DemoCommandDeps, ctx: InsertCtx) => {
		console.log('Inserting Item', ctx);
	},
	(_deps: DemoCommandDeps, ctx: InsertCtx) => {
		console.log('Undoing Item', ctx);
	},
	(_deps: DemoCommandDeps, ctx: InsertCtx) => {
		console.log('Insert Failed', ctx);
	},
	(_deps: DemoCommandDeps, ctx: InsertCtx) => {
		console.log('Undo Failed', ctx);
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

const optimisticInsertPipelineStep = pipelineStep<DemoCommandDeps, InsertCtx>(
	(deps, ctx) => {
		const { key, insertValue } = ctx;
		const { memoryStorage } = deps;

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

const insertAsyncPiplineStep = pipelineStep<DemoCommandDeps, InsertCtx, string>(
	async (deps, ctx) => {
		const { key, insertValue } = ctx;
		const { farAwayStorage } = deps;

		await sleep(1000);

		farAwayStorage.set(key, insertValue);

		return `Inserted [${key}, ${insertValue}]`;
	},
	async (deps, ctx) => {
		const { key, undoValue, insertValue } = ctx;
		const { farAwayStorage } = deps;

		await sleep(1000);

		if (undoValue === undefined) {
			farAwayStorage.delete(key);
		} else {
			farAwayStorage.set(key, undoValue);
		}

		return undoValue === undefined
			? `Undone Insertion, deleting - [${key}]`
			: `Undone Insertion key: [${key}], value: [${insertValue}] -> [${undoValue}]`;
	}
);

export const insertSteps = [
	startingStep,
	optimisticInsertPipelineStep,
	insertAsyncPiplineStep,
	endStep
] satisfies PipelineSteps<DemoCommandDeps, InsertCtx>;
