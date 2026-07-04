import { sleep } from '$lib/engine/general-js-ts/common';
import { type PipelineSteps } from '../pipeline/pipeline-command';
import { pipelineStep } from '../pipeline/pipeline-step';
import type { DemoCommandDeps } from './pipeline-common';

export type ClearCtx = {
	storageState: Map<string, string>;
};

const startingStep = pipelineStep<DemoCommandDeps, ClearCtx>(
	(_deps, ctx) => {
		console.log('Clearing Storeage', ctx);
	},
	(_deps, ctx) => {
		console.log('Undoing Clear Storeage', ctx);
	},
	(_deps, ctx) => {
		console.log('Clear Storeage Failed', ctx);
	},
	(_deps, ctx) => {
		console.log('Undo Clear Storeage Failed', ctx);
	}
);

const optimisticClearPipelineStep = pipelineStep<DemoCommandDeps, ClearCtx>(
	(deps, _ctx) => {
		let { memoryStorage } = deps;

		memoryStorage.clear();
	},
	(deps, ctx) => {
		let { storageState } = ctx;
		let { memoryStorage } = deps;

		storageState.forEach((val, key) => memoryStorage.set(key, val));
	}
);

const clearAsyncPiplineStep = pipelineStep(
	async (deps: DemoCommandDeps, _ctx: ClearCtx) => {
		let { farAwayStorage } = deps;

		await sleep(1000);
		farAwayStorage.clear();

		let retVal = `Clear farAwayStorage ${Array(farAwayStorage.entries().map(([key, val]) => key + ' - ' + val)).join(',')}`;

		return retVal;
	},
	async (deps, ctx) => {
		let { storageState } = ctx;
		let { farAwayStorage } = deps;

		await sleep(1000);

		storageState.forEach((val, key) => farAwayStorage.set(key, val));
		let retVal = `Undo Clear farAwayStorage ${Array(farAwayStorage.entries().map(([key, val]) => key + ' - ' + val)).join(',')}`;

		return retVal;
	}
);

const endStep = pipelineStep<DemoCommandDeps, ClearCtx>(
	(_deps, ctx) => {
		console.log('Successfully Cleared Storage', ctx);
	},

	(_deps, ctx) => {
		console.log('Undone Clear Storage', ctx);
	}
);

export const clearSteps = [
	startingStep,
	optimisticClearPipelineStep,
	clearAsyncPiplineStep,
	endStep
] satisfies PipelineSteps<DemoCommandDeps, ClearCtx>;
