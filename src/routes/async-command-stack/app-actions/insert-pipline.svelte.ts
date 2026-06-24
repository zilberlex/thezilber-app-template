import { sleep } from '$lib/engine/general-js-ts/common';
import { pipelineCommand } from '../pipeline/pipeline-command';
import { pipelineStep, pipelineSuccessResult, type SuccessResult } from '../pipeline/pipeline-step';

export type InsertCtx = {
	insertValue: string;
	undoValue?: string;
	key: string;
};

let _memoryStorage: Map<string, string>;
let _farAwayStorage: Map<string, string>;

export function constructInsertPipelineCommand(
	memoryStorage: Map<string, string>,
	farAwayStorage: Map<string, string>,
	insertCtx: InsertCtx
) {
	_memoryStorage = memoryStorage;
	_farAwayStorage = farAwayStorage;

	let command = pipelineCommand(insertCtx, [
		startingStep,
		optimisticInsertPipelineStep,
		insertAsyncPiplineStep,
		endStep
	]);

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
		_memoryStorage.set(ctx.key, ctx.insertValue);
	},
	(ctx: InsertCtx) => {
		let { undoValue } = ctx;

		if (!undoValue) {
			_memoryStorage.delete(ctx.key);
		} else {
			_memoryStorage.set(ctx.key, undoValue);
		}
	}
);

const insertAsyncPiplineStep = pipelineStep(
	async (ctx: InsertCtx) => {
		let { key, insertValue } = ctx;

		// simulate async
		await sleep(1000);
		_farAwayStorage.set(key, insertValue);

		let retVal = `Inserted [${key}, ${insertValue}]`;

		return retVal;
	},
	async (ctx: InsertCtx) => {
		let { key, undoValue, insertValue } = ctx;

		// simulate async
		await sleep(1000);

		if (!undoValue) {
			_farAwayStorage.delete(key);
		} else {
			_farAwayStorage.set(key, undoValue);
		}

		let retVal = !undoValue
			? `Undone Insertion, deleting - [${key}]`
			: `Undone Insertion key: [${key}], value: [${insertValue}] -> [${undoValue}]`;

		return retVal;
	}
);
