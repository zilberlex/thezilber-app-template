import type { PersistableItem } from '$lib/engine/patterns/command/persistancy/persistent-item';
import { RecentItemsCache } from '../../recent-items-cache';
import { successResult } from '../../result/common';
import type { ErrorResult, SuccessResult } from '../../result/types';
import { type AsyncCommandInterface } from '../async-command';
import type { FullPipelineCtx, PersistedPipelineCommand, PipelineStep, PipelineSteps } from './types';

type StepResult<S> = S extends PipelineStep<any, any, infer R, any> ? Awaited<R> : never;

type NonEmptyArray<T> = [T, ...T[]];

type AnyPipelineStep<Deps, Ctx, E extends Error> = PipelineStep<Deps, Ctx, any, E>;

type LastNonVoidStepReturn<Steps extends readonly unknown[]> = Steps extends readonly [...infer Rest, infer LastStep]
	? [StepResult<LastStep>] extends [void]
		? LastNonVoidStepReturn<Rest>
		: StepResult<LastStep>
	: void;

function hasSuccessValue(result: SuccessResult<any>): result is { ok: true; value: unknown } {
	return 'value' in result;
}

/**
 * Ordered, undoable command pipeline.
 *
 * execute(): steps in order.
 * undo(): steps in order, for optimistic rollback.
 * execute failure: compensate executed steps in reverse with executeError().
 * undo failure: compensate undone steps in reverse with undoError().
 *
 * Returns the last non-void success value.
 *
 * ErrorResult = expected failure;
 * Throw = unexpected failure.
 */
export function pipelineCommand<
	KCommandType extends string,
	Deps,
	PipelineCtx,
	E extends Error,
	Steps extends PipelineSteps<Deps, PipelineCtx, E>
>(type: KCommandType, deps: Deps, ctx: PipelineCtx, steps: Steps) {
	return new PipelineCommand<KCommandType, Deps, PipelineCtx, E, Steps>(type, deps, ctx, steps);
}

export class PipelineCommand<
	KCommandType extends string,
	Deps,
	PipelineCtx,
	E extends Error,
	Steps extends NonEmptyArray<AnyPipelineStep<Deps, PipelineCtx, E>>
>
	implements
		AsyncCommandInterface<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>>,
		PersistableItem<PersistedPipelineCommand>
{
	#itemType: KCommandType;

	#recentOperationCache = new RecentItemsCache<FullPipelineCtx<PipelineCtx>>();

	#deps: Deps;
	#baseCtx: PipelineCtx;
	#steps: Steps;
	#hydrateFunc: (ctx: PipelineCtx) => void;

	constructor(
		commandType: KCommandType,
		deps: Deps,
		ctx: PipelineCtx,
		steps: Steps,
		hydrateFunc: (ctx: PipelineCtx) => void = (_ctx) => {}
	) {
		this.#deps = deps;
		this.#baseCtx = ctx;
		this.#steps = steps;
		this.#itemType = commandType;
		this.#hydrateFunc = hydrateFunc;

		this.#recentOperationCache.add({
			opId: 0,
			operationStatus: 'initialized',
			ctx: structuredClone(ctx)
		});
	}

	get executed() {
		return this.#recentOperationCache.getLatest()?.operationStatus === 'executed';
	}

	get itemType() {
		return this.#itemType;
	}

	persist(): PersistedPipelineCommand<KCommandType, PipelineCtx> {
		return {
			itemType: this.itemType,
			baseCtx: this.#baseCtx,
			operationStatusHistory: structuredClone(this.#recentOperationCache.persist())
		};
	}

	hydrateCommand(persistedCommand: PersistedPipelineCommand<KCommandType, PipelineCtx>) {
		const { baseCtx: ctx, operationStatusHistory } = persistedCommand;
		this.#baseCtx = ctx;

		this.#recentOperationCache.hydrate(operationStatusHistory);

		this.#hydrateFunc(persistedCommand.baseCtx);
	}

	async execute(): Promise<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
		console.log('[PipelineCommand] Executing Command', {
			commandType: this.#itemType,
			baseCtx: this.#baseCtx
		});

		let lastFullCtx = this.#recentOperationCache.getLatest();

		if (lastFullCtx === undefined) {
			throw new Error(
				'[PipelineCommand] improper initialization of PipelineCommand, lastOperationStatus to be initialized'
			);
		}

		if (
			lastFullCtx.operationStatus !== 'initialized' &&
			lastFullCtx.operationStatus !== 'undoing' &&
			lastFullCtx.operationStatus !== 'undone'
		) {
			throw new Error(
				`[PipelineCommand] Can not Execute non Undoing, Undone, or Initialized Commands. lastOperationStatus: [${lastFullCtx.operationStatus}]`
			);
		}

		const fullPipelineCtx: FullPipelineCtx<PipelineCtx> = {
			opId: lastFullCtx.opId++,
			operationStatus: 'executing',
			ctx: structuredClone(this.#baseCtx)
		};

		this.#recentOperationCache.add(fullPipelineCtx);

		console.log('[PipelineCommand] Executing Command', {
			commandType: this.#itemType,
			baseCtx: this.#baseCtx,
			fullPipelineCtx,
			lastFullCtx: lastFullCtx
		});

		const executedSteps: AnyPipelineStep<Deps, PipelineCtx, E>[] = [];

		let commandResult: SuccessResult<any> = successResult();

		try {
			for (const step of this.#steps) {
				const stepResult = await Promise.resolve(step.execute(this.#deps, fullPipelineCtx.ctx));

				if (!stepResult.ok) {
					for (const executedStep of executedSteps.reverse()) {
						await Promise.resolve(executedStep.executeError(this.#deps, fullPipelineCtx.ctx, stepResult.error));
					}

					fullPipelineCtx.operationStatus = 'execute-error';
					return stepResult;
				}

				if (hasSuccessValue(stepResult)) {
					commandResult = stepResult;
				}

				executedSteps.push(step);
			}

			fullPipelineCtx.operationStatus = 'executed';

			return commandResult as SuccessResult<LastNonVoidStepReturn<Steps>>;
		} catch (e) {
			fullPipelineCtx.operationStatus = 'execute-error';
			throw e;
		}
	}

	async undo(): Promise<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
		let lastFullCtx = structuredClone(this.#recentOperationCache.getLatest());

		if (lastFullCtx === undefined) {
			throw new Error(
				'[PipelineCommand] Undo improper initialization of PipelineCommand, lastOperationStatus to be initialized, but no lastOperation found'
			);
		}

		if (lastFullCtx.operationStatus !== 'executing' && lastFullCtx.operationStatus !== 'executed') {
			throw new Error(
				`[PipelineCommand] Can not Undo non Executed or Executing Commands. lastOperationStatus: [${lastFullCtx.operationStatus}]`
			);
		}

		const fullPipelineCtx: FullPipelineCtx<PipelineCtx> = {
			opId: lastFullCtx.opId++,
			operationStatus: 'executing',
			ctx: structuredClone(lastFullCtx.ctx)
		};

		this.#recentOperationCache.add(fullPipelineCtx);

		console.log('[PipelineCommand] Undoing Command', {
			commandType: this.#itemType,
			baseCtx: this.#baseCtx,
			fullPipelineCtx,
			lastFullCtx: lastFullCtx
		});

		let currentCtx = fullPipelineCtx.ctx;

		const undoneSteps: AnyPipelineStep<Deps, PipelineCtx, E>[] = [];

		let commandResult: SuccessResult<any> = successResult();

		fullPipelineCtx.operationStatus = 'undoing';

		try {
			for (const step of this.#steps) {
				const stepResult = await Promise.resolve(step.undo(this.#deps, currentCtx));

				if (!stepResult.ok) {
					for (const undoneStep of undoneSteps.reverse()) {
						await Promise.resolve(undoneStep.undoError?.(this.#deps, currentCtx, stepResult.error));
					}

					fullPipelineCtx.operationStatus = 'undo-error';
					return stepResult;
				}

				if (hasSuccessValue(stepResult)) {
					commandResult = stepResult;
				}

				undoneSteps.push(step);
			}

			fullPipelineCtx.operationStatus = 'undone';

			return commandResult as SuccessResult<LastNonVoidStepReturn<Steps>>;
		} catch (e) {
			fullPipelineCtx.operationStatus = 'undo-error';
			throw e;
		}
	}
}
