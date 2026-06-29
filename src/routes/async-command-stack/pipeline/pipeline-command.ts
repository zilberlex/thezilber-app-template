import { type AsyncCommandInterface } from '../commands/async-command';
import { pipelineSuccessResult, type ErrorResult, type PipelineStep, type SuccessResult } from './pipeline-step';

type StepResult<S> = S extends PipelineStep<any, any, infer R, any> ? Awaited<R> : never;

type NonEmptyArray<T> = [T, ...T[]];

type AnyPipelineStep<Deps, Ctx, E extends Error> = PipelineStep<Deps, Ctx, any, E>;

type LastNonVoidStepReturn<Steps extends readonly unknown[]> = Steps extends readonly [...infer Rest, infer LastStep]
	? [StepResult<LastStep>] extends [void]
		? LastNonVoidStepReturn<Rest>
		: StepResult<LastStep>
	: void;

type OperationStatus = 'initialized' | 'executing' | 'executed' | 'undoing' | 'undone' | 'execute-error' | 'undo-error';

export type PeristentCommand<PipelineCtx> = {
	commandType: string;
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
	Deps,
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<Deps, PipelineCtx, E>>,
	E extends Error
>(type: string, deps: Deps, ctx: PipelineCtx, steps: Steps) {
	return new PipelineCommand(type, deps, ctx, steps);
}

export class PipelineCommand<
	Deps,
	PipelineCtx,
	Steps extends NonEmptyArray<AnyPipelineStep<Deps, PipelineCtx, E>>,
	E extends Error
> implements AsyncCommandInterface<SuccessResult<LastNonVoidStepReturn<Steps>> | ErrorResult<E>> {
	#commandType: string;

	#operationStatus: OperationStatus;
	#deps: Deps;
	#baseCtx: PipelineCtx;
	#steps: Steps;
	#lastExecutePipelineCtx?: PipelineCtx;

	constructor(commandType: string, deps: Deps, ctx: PipelineCtx, steps: Steps) {
		this.#deps = deps;
		this.#baseCtx = ctx;
		this.#steps = steps;
		this.#commandType = commandType;
		this.#operationStatus = 'initialized';
	}

	get commandType() {
		return this.#commandType;
	}

	persistCommand(): PeristentCommand<PipelineCtx> {
		return {
			commandType: this.commandType,
			baseCtx: this.#baseCtx,
			operationStatus: this.#operationStatus,
			lastExecutePipelineCtx: this.#lastExecutePipelineCtx
		};
	}

	hydrateCommand(persistantCommand: PeristentCommand<PipelineCtx>) {
		const { baseCtx: ctx, operationStatus, lastExecutePipelineCtx } = persistantCommand;
		this.#baseCtx = ctx;
		this.#operationStatus = operationStatus;
		this.#lastExecutePipelineCtx = lastExecutePipelineCtx;
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
