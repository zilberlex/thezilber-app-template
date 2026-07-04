import type { PersistedCommand } from '$lib/engine/patterns/command/persistent-command';
import type { PersistableItem } from '$lib/engine/patterns/persistancy/persistent-item';
import { type AsyncCommandInterface } from '../../../lib/engine/patterns/command/async-command';
import { pipelineSuccessResult, type ErrorResult, type PipelineStep, type SuccessResult } from './pipeline-step';

type StepResult<S> = S extends PipelineStep<any, any, infer R, any> ? Awaited<R> : never;

type NonEmptyArray<T> = [T, ...T[]];

type AnyPipelineStep<Deps, Ctx, E extends Error> = PipelineStep<Deps, Ctx, any, E>;

export type PipelineSteps<Deps, Ctx, E extends Error = Error> = NonEmptyArray<PipelineStep<Deps, Ctx, any, E>>;

type LastNonVoidStepReturn<Steps extends readonly unknown[]> = Steps extends readonly [...infer Rest, infer LastStep]
	? [StepResult<LastStep>] extends [void]
		? LastNonVoidStepReturn<Rest>
		: StepResult<LastStep>
	: void;

type OperationStatus = 'initialized' | 'executing' | 'executed' | 'undoing' | 'undone' | 'execute-error' | 'undo-error';

export type PersistedPipelineCommand<
	CommandType extends string = string,
	PipelineCtx = unknown
> = PersistedCommand<CommandType> & {
	baseCtx: PipelineCtx;
	lastExecutePipelineCtx?: PipelineCtx;
	operationStatus: OperationStatus;
};

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
	Steps extends PipelineSteps<Deps, PipelineCtx, E>,
	E extends Error
>(type: KCommandType, deps: Deps, ctx: PipelineCtx, steps: Steps) {
	return new PipelineCommand(type, deps, ctx, steps);
}

export class PipelineCommand<
	KCommandType extends string,
	Deps,
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<Deps, PipelineCtx, E>>,
	E extends Error
>
	implements
		AsyncCommandInterface<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>>,
		PersistableItem<PersistedPipelineCommand>
{
	#itemType: KCommandType;

	#operationStatus: OperationStatus;
	#deps: Deps;
	#baseCtx: PipelineCtx;
	#steps: Steps;
	#lastExecutePipelineCtx?: PipelineCtx;
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
		this.#operationStatus = 'initialized';
		this.#hydrateFunc = hydrateFunc;
	}

	get executed() {
		return this.#operationStatus === 'executed';
	}

	get itemType() {
		return this.#itemType;
	}

	persist(): PersistedPipelineCommand<KCommandType, PipelineCtx> {
		return {
			itemType: this.itemType,
			baseCtx: this.#baseCtx,
			operationStatus: this.#operationStatus,
			lastExecutePipelineCtx: this.#lastExecutePipelineCtx
		};
	}

	hydrateCommand(persistedCommand: PersistedPipelineCommand<KCommandType, PipelineCtx>) {
		const { baseCtx: ctx, operationStatus, lastExecutePipelineCtx } = persistedCommand;
		this.#baseCtx = ctx;
		this.#operationStatus = operationStatus;
		this.#lastExecutePipelineCtx = lastExecutePipelineCtx;

		this.#hydrateFunc(persistedCommand.baseCtx);
	}

	async execute(): Promise<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
		const currentCtx = structuredClone(this.#baseCtx);

		const executedSteps: AnyPipelineStep<Deps, PipelineCtx, E>[] = [];

		let commandResult: SuccessResult<any> = pipelineSuccessResult();

		if (!(this.#operationStatus == 'initialized' || this.#operationStatus == 'undone')) {
			throw new Error(
				`Execute Error on command. Only Undone or initialized Commands can be Executed. lastOperationStatus: [${this.#operationStatus}]`
			);
		}

		this.#operationStatus = 'executing';
		try {
			for (const step of this.#steps) {
				const stepResult = await Promise.resolve(step.execute(this.#deps, currentCtx));

				if (!stepResult.ok) {
					for (const executedStep of executedSteps.reverse()) {
						await Promise.resolve(executedStep.executeError(this.#deps, currentCtx));
					}

					this.#operationStatus = 'execute-error';
					return stepResult;
				}

				if (hasSuccessValue(stepResult)) {
					commandResult = stepResult;
				}

				executedSteps.push(step);
			}

			this.#operationStatus = 'executed';
			this.#lastExecutePipelineCtx = currentCtx;

			return commandResult as SuccessResult<LastNonVoidStepReturn<Steps>>;
		} catch (e) {
			this.#operationStatus = 'execute-error';
			throw e;
		}
	}

	async undo(): Promise<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
		if (this.#operationStatus != 'executed' || this.#lastExecutePipelineCtx === undefined) {
			throw new Error(
				`Undo Error on command. Only Executed Commands can be undone. lastOperationStatus: [${this.#operationStatus}]`
			);
		}

		let currentCtx = structuredClone(this.#lastExecutePipelineCtx);

		const undoneSteps: AnyPipelineStep<Deps, PipelineCtx, E>[] = [];

		let commandResult: SuccessResult<any> = pipelineSuccessResult();

		this.#operationStatus = 'undoing';

		try {
			for (const step of this.#steps) {
				const stepResult = await Promise.resolve(step.undo(this.#deps, currentCtx));

				if (!stepResult.ok) {
					for (const undoneStep of undoneSteps.reverse()) {
						await Promise.resolve(undoneStep.undoError?.(this.#deps, currentCtx));
					}

					this.#operationStatus = 'undo-error';
					return stepResult;
				}

				if (hasSuccessValue(stepResult)) {
					commandResult = stepResult;
				}

				undoneSteps.push(step);
			}

			this.#operationStatus = 'undone';

			this.#lastExecutePipelineCtx = undefined;

			return commandResult as SuccessResult<LastNonVoidStepReturn<Steps>>;
		} catch (e) {
			this.#operationStatus = 'undo-error';
			throw e;
		}
	}
}
