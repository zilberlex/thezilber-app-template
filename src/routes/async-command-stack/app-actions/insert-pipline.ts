import { sleep } from '$lib/engine/general-js-ts/common';
import { pipelineCommand } from '../pipeline/pipeline-command';
import { pipelineStep } from '../pipeline/pipeline-step';
import type { DemoCommandDeps, DemoCommandType } from './demo-command-factory';

export type InsertCtx = {
	insertValue: string;
	undoValue?: string;
	key: string;
};

export type InsertPipelineDeps = DemoCommandDeps;

export function constructInsertPipelineCommand(
	commandType: DemoCommandType,
	memoryStorage: Map<string, string>,
	farAwayStorage: Map<string, string>,
	insertCtx: InsertCtx
) {
	let command = pipelineCommand(
		commandType,
		{
			memoryStorage,
			farAwayStorage
		},
		insertCtx,
		[startingStep, optimisticInsertPipelineStep, insertAsyncPiplineStep, endStep]
	);

	return command;
}

const startingStep = pipelineStep(
	(_deps: InsertPipelineDeps, ctx: InsertCtx) => {
		console.log('Inserting Item', ctx);
	},
	(_deps: InsertPipelineDeps, ctx: InsertCtx) => {
		console.log('Undoing Item', ctx);
	},
	(_deps: InsertPipelineDeps, ctx: InsertCtx) => {
		console.log('Insert Failed', ctx);
	},
	(_deps: InsertPipelineDeps, ctx: InsertCtx) => {
		console.log('Undo Failed', ctx);
	}
);

const endStep = pipelineStep(
	(_deps: InsertPipelineDeps, ctx: InsertCtx) => {
		console.log('Successfully Inserted Item', ctx);
	},
	(_deps: InsertPipelineDeps, ctx: InsertCtx) => {
		console.log('Successfully Undone Insertion', ctx);
	}
);

const optimisticInsertPipelineStep = pipelineStep(
	(deps: InsertPipelineDeps, ctx: InsertCtx) => {
		let { key, insertValue } = ctx;
		let { memoryStorage } = deps;

		memoryStorage.set(key, insertValue);
	},
	(deps: InsertPipelineDeps, ctx: InsertCtx) => {
		let { undoValue, key } = ctx;
		let { memoryStorage } = deps;

		if (undoValue === undefined) {
			memoryStorage.delete(key);
		} else {
			memoryStorage.set(key, undoValue);
		}
	}
);

const insertAsyncPiplineStep = pipelineStep(
	async (deps: InsertPipelineDeps, ctx: InsertCtx) => {
		let { key, insertValue } = ctx;
		let { farAwayStorage } = deps;

		// simulate async
		await sleep(1000);
		farAwayStorage.set(key, insertValue);

		let retVal = `Inserted [${key}, ${insertValue}]`;

		return retVal;
	},
	async (deps: InsertPipelineDeps, ctx: InsertCtx) => {
		let { key, undoValue, insertValue } = ctx;
		let { farAwayStorage } = deps;

		// simulate async
		await sleep(1000);

		if (undoValue === undefined) {
			farAwayStorage.delete(key);
		} else {
			farAwayStorage.set(key, undoValue);
		}

		let retVal =
			undoValue === undefined
				? `Undone Insertion, deleting - [${key}]`
				: `Undone Insertion key: [${key}], value: [${insertValue}] -> [${undoValue}]`;

		return retVal;
	}
);
