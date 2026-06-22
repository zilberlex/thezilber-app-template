import { type AsyncCommandInterface } from '../commands/async-command';
import type { ErrorResult, PipelineStep, SuccessResult } from './pipeline-step';

type StepResult<S> = S extends PipelineStep<any, infer R, any> ? Awaited<R> : never;

// TODO Move to typescript file helpers
type Last<T extends NonEmptyArray<unknown>> = T extends readonly [...unknown[], infer L] ? L : never;
type NonEmptyArray<T> = [T, ...T[]];

type LastStepReturn<Steps extends NonEmptyArray<PipelineStep<any, any, any>>> = StepResult<Last<Steps>>;

type AnyPipelineStep<Ctx, E extends Error> = PipelineStep<Ctx, any, E>;

export function pipelineCommand<
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<PipelineCtx, E>>,
	E extends Error
>(ctx: PipelineCtx, steps: Steps) {
	return new PipelineCommand(ctx, steps);
}

export class PipelineCommand<
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<PipelineCtx, E>>,
	E extends Error
> implements AsyncCommandInterface<SuccessResult<LastStepReturn<Steps>> | ErrorResult<E>> {
	#operationStatus: 'initialized' | 'executing' | 'executed' | 'undoing' | 'undone' | 'execute-error' | 'undo-error' =
		'initialized';

	#executedPipelineCtx: PipelineCtx;
	#steps: Steps;
	#lastExecutePipelineCtx?: PipelineCtx;

	constructor(ctx: PipelineCtx, steps: Steps) {
		this.#executedPipelineCtx = ctx;
		this.#steps = steps;
	}

	async execute(): Promise<SuccessResult<LastStepReturn<Steps>> | ErrorResult<E>> {
		const currentCtx = structuredClone(this.#executedPipelineCtx);

		const executedSteps: AnyPipelineStep<PipelineCtx, E>[] = [];

		let lastStepResult: SuccessResult<any> | ErrorResult<E>;

		if (!(this.#operationStatus == 'initialized' || this.#operationStatus == 'undone')) {
			throw new Error(
				`Execute Error on command. Only Undone or initialized Commands can be Executed. lastOperationStatus: [${this.#operationStatus}]`
			);
		}

		this.#operationStatus = 'executing';
		for (const step of this.#steps) {
			lastStepResult = await Promise.resolve(step.execute(currentCtx));

			if (!lastStepResult.ok) {
				for (const executedStep of executedSteps.reverse()) {
					await Promise.resolve(executedStep.executeError(currentCtx));
				}

				this.#operationStatus = 'execute-error';
				return lastStepResult;
			}

			executedSteps.push(step);
		}

		this.#operationStatus = 'executed';
		this.#lastExecutePipelineCtx = currentCtx;

		// @ts-ignore - This is save because steps is non empty.
		return lastStepResult as SuccessResult<LastStepReturn<Steps>>;
	}

	async undo(): Promise<SuccessResult<LastStepReturn<Steps>> | ErrorResult<E>> {
		if (this.#operationStatus != 'executed' || this.#lastExecutePipelineCtx === undefined) {
			throw new Error(
				`Undo Error on command. Only Executed Commands can be undone. lastOperationStatus: [${this.#operationStatus}]`
			);
		}

		let currentCtx = structuredClone(this.#lastExecutePipelineCtx);

		const undoneSteps: AnyPipelineStep<PipelineCtx, E>[] = [];

		let lastUndoStepResult: SuccessResult<any> | ErrorResult<E>;

		this.#operationStatus = 'undoing';
		for (const step of this.#steps) {
			lastUndoStepResult = await Promise.resolve(step.undo(currentCtx));

			if (!lastUndoStepResult.ok) {
				for (const undoneStep of undoneSteps.reverse()) {
					await Promise.resolve(undoneStep.executeError(currentCtx));
				}

				this.#operationStatus = 'undo-error';
				return lastUndoStepResult;
			}

			undoneSteps.push(step);
		}

		this.#operationStatus = 'undone';

		this.#lastExecutePipelineCtx = undefined;

		// @ts-ignore - This is save because steps is non empty.
		return lastUndoStepResult as SuccessResult<LastStepReturn<Steps>>;
	}
}
