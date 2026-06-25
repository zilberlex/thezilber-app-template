import { type AsyncCommandInterface } from '../commands/async-command';
import { pipelineSuccessResult, type ErrorResult, type PipelineStep, type SuccessResult } from './pipeline-step';

type StepResult<S> = S extends PipelineStep<any, infer R, any> ? Awaited<R> : never;

type NonEmptyArray<T> = [T, ...T[]];

type AnyPipelineStep<Ctx, E extends Error> = PipelineStep<Ctx, any, E>;

type LastNonVoidStepReturn<Steps extends readonly unknown[]> = Steps extends readonly [...infer Rest, infer LastStep]
	? [StepResult<LastStep>] extends [void]
		? LastNonVoidStepReturn<Rest>
		: StepResult<LastStep>
	: void;

type CloneCtx<Ctx> = (ctx: Ctx) => Ctx;

const defaultCloneCtx = <Ctx>(ctx: Ctx): Ctx => structuredClone(ctx);

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
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<PipelineCtx, E>>,
	E extends Error
>(ctx: PipelineCtx, steps: Steps, cloneCtx: CloneCtx<PipelineCtx> = defaultCloneCtx) {
	return new PipelineCommand(ctx, steps, cloneCtx);
}

export class PipelineCommand<
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<PipelineCtx, E>>,
	E extends Error
> implements AsyncCommandInterface<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
	#operationStatus: 'initialized' | 'executing' | 'executed' | 'undoing' | 'undone' | 'execute-error' | 'undo-error' =
		'initialized';

	#baseCtx: PipelineCtx;
	#steps: Steps;
	#lastExecutePipelineCtx?: PipelineCtx;
	#cloneCtx: CloneCtx<PipelineCtx>;

	constructor(ctx: PipelineCtx, steps: Steps, cloneCtx: CloneCtx<PipelineCtx> = defaultCloneCtx) {
		this.#baseCtx = ctx;
		this.#steps = steps;
		this.#cloneCtx = cloneCtx;
	}

	async execute(): Promise<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
		const currentCtx = this.#cloneCtx(this.#baseCtx);

		const executedSteps: AnyPipelineStep<PipelineCtx, E>[] = [];

		let commandResult: SuccessResult<any> = pipelineSuccessResult();

		if (!(this.#operationStatus == 'initialized' || this.#operationStatus == 'undone')) {
			throw new Error(
				`Execute Error on command. Only Undone or initialized Commands can be Executed. lastOperationStatus: [${this.#operationStatus}]`
			);
		}

		this.#operationStatus = 'executing';
		try {
			for (const step of this.#steps) {
				const stepResult = await Promise.resolve(step.execute(currentCtx));

				if (!stepResult.ok) {
					for (const executedStep of executedSteps.reverse()) {
						await Promise.resolve(executedStep.executeError(currentCtx));
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

		let currentCtx = this.#cloneCtx(this.#lastExecutePipelineCtx);

		const undoneSteps: AnyPipelineStep<PipelineCtx, E>[] = [];

		let commandResult: SuccessResult<any> = pipelineSuccessResult();

		this.#operationStatus = 'undoing';

		try {
			for (const step of this.#steps) {
				const stepResult = await Promise.resolve(step.undo(currentCtx));

				if (!stepResult.ok) {
					for (const undoneStep of undoneSteps.reverse()) {
						await Promise.resolve(undoneStep.undoError?.(currentCtx));
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
