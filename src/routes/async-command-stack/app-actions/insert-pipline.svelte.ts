import { sleep } from '$lib/engine/general-js-ts/common';
import { pipelineCommand } from '../pipeline/pipeline-command';
import { pipelineStep, pipelineStepSuccess } from '../pipeline/pipeline-step';

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
		return pipelineStepSuccess();
	},
	(ctx: InsertCtx) => {
		console.log('Undoing Item', ctx);
		return pipelineStepSuccess();
	},
	(ctx: InsertCtx) => {
		console.log('Insert Failed', ctx);
		return pipelineStepSuccess();
	},
	(ctx: InsertCtx) => {
		console.log('Undo Failed', ctx);
		return pipelineStepSuccess();
	}
);

const endStep = pipelineStep(
	(ctx: InsertCtx) => {
		console.log('Successfully Inserted Item', ctx);
		return pipelineStepSuccess();
	},
	(ctx: InsertCtx) => {
		console.log('Successfully Undone Insertion', ctx);
		return pipelineStepSuccess();
	}
);

const optimisticInsertPipelineStep = pipelineStep<InsertCtx, void, Error>(
	(ctx: InsertCtx) => {
		_memoryStorage.set(ctx.key, ctx.insertValue);

		return { ok: true };
	},
	(ctx: InsertCtx) => {
		let { undoValue } = ctx;

		if (!undoValue) {
			_memoryStorage.delete(ctx.key);
		} else {
			_memoryStorage.set(ctx.key, undoValue);
		}

		return { ok: true };
	}
);

const insertAsyncPiplineStep = pipelineStep(
	async (ctx: InsertCtx) => {
		let { key, insertValue } = ctx;

		// simulate async
		await sleep(1000);
		_farAwayStorage.set(key, insertValue);

		return { ok: true, value: `Inserted [${key}, ${insertValue}]` };
	},
	async (ctx: InsertCtx) => {
		let { key, undoValue, insertValue } = ctx;

		// simulate async
		await sleep(1000);
		if (!undoValue) {
			_farAwayStorage.delete(key);
			return { ok: true, value: `Undone Insertion, deleting - [${key}]` };
		} else {
			_farAwayStorage.set(key, undoValue);
			return { ok: true, value: `Undone Insertion key: [${key}], value: [${insertValue}] -> [${undoValue}]` };
		}
	}
);
