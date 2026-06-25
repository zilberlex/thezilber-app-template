import { sleep } from '$lib/engine/general-js-ts/common';
import { pipelineCommand } from '../pipeline/pipeline-command';
import { pipelineStep } from '../pipeline/pipeline-step';

export type DemoPiplineCtx<StepData> = {
	deps: {
		memoryStorage: Map<string, string>;
		farAwayStorage: Map<string, string>;
	};
	stepData: StepData;
};

export type InsertPipelineData = {
	insertValue: string;
	undoValue?: string;
	key: string;
};

export type InsertCtx = DemoPiplineCtx<InsertPipelineData>;

export function constructInsertPipelineCommand(
	memoryStorage: Map<string, string>,
	farAwayStorage: Map<string, string>,
	insertStepCtx: InsertPipelineData
) {
	let command = pipelineCommand(
		{
			deps: {
				memoryStorage,
				farAwayStorage
			},
			stepData: insertStepCtx
		},
		[startingStep, optimisticInsertPipelineStep, insertAsyncPiplineStep, endStep],
		(ctx: InsertCtx) => ({
			deps: ctx.deps,
			stepData: structuredClone(ctx.stepData)
		})
	);

	return command;
}

const startingStep = pipelineStep(
	(ctx: InsertCtx) => {
		console.log('Inserting Item', ctx);
	},
	(ctx: InsertCtx) => {
		console.log('Undoing Item', ctx);
	},
	(ctx: InsertCtx) => {
		console.log('Insert Failed', ctx);
	},
	(ctx: InsertCtx) => {
		console.log('Undo Failed', ctx);
	}
);

const endStep = pipelineStep(
	(ctx: InsertCtx) => {
		console.log('Successfully Inserted Item', ctx);
	},
	(ctx: InsertCtx) => {
		console.log('Successfully Undone Insertion', ctx);
	}
);

const optimisticInsertPipelineStep = pipelineStep<InsertCtx, void, Error>(
	(ctx: InsertCtx) => {
		let { key, insertValue } = ctx.stepData;
		let { memoryStorage } = ctx.deps;

		memoryStorage.set(key, insertValue);
	},
	(ctx: InsertCtx) => {
		let { undoValue, key } = ctx.stepData;
		let { memoryStorage } = ctx.deps;

		if (!undoValue) {
			memoryStorage.delete(key);
		} else {
			memoryStorage.set(key, undoValue);
		}
	}
);

const insertAsyncPiplineStep = pipelineStep(
	async (ctx: InsertCtx) => {
		let { key, insertValue } = ctx.stepData;
		let { farAwayStorage } = ctx.deps;

		// simulate async
		await sleep(1000);
		farAwayStorage.set(key, insertValue);

		let retVal = `Inserted [${key}, ${insertValue}]`;

		return retVal;
	},
	async (ctx: InsertCtx) => {
		let { key, undoValue, insertValue } = ctx.stepData;
		let { farAwayStorage } = ctx.deps;

		// simulate async
		await sleep(1000);

		if (!undoValue) {
			farAwayStorage.delete(key);
		} else {
			farAwayStorage.set(key, undoValue);
		}

		let retVal = !undoValue
			? `Undone Insertion, deleting - [${key}]`
			: `Undone Insertion key: [${key}], value: [${insertValue}] -> [${undoValue}]`;

		return retVal;
	}
);
