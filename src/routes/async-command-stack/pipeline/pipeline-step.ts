export type ResultLike = {
	ok: boolean;
};

export type ErrorResult<E extends Error> = {
	ok: false;
	error: E;
};

export type SuccessResult<T = void> = [T] extends [void]
	? {
			ok: true;
		}
	: {
			ok: true;
			value: T;
		};

export type MaybePromise<T> = T | Promise<T>;

export function pipelineSuccessResult<T = void>(value?: T): SuccessResult<T> {
	return (arguments.length === 0 ? { ok: true } : { ok: true, value }) as SuccessResult<T>;
}

export function pipelineFailResult<E extends Error>(e: E): ErrorResult<E> {
	return { ok: false, error: e };
}

type PipelineStepReturn<R, E extends Error> = void | R | SuccessResult<R> | ErrorResult<E>;

export type PipelineStep<Ctx, R = void, E extends Error = Error> = {
	execute: (ctx: Ctx) => MaybePromise<SuccessResult<R> | ErrorResult<E>>;
	undo: (ctx: Ctx) => MaybePromise<SuccessResult<R> | ErrorResult<E>>;
	executeError: (ctx: Ctx) => MaybePromise<SuccessResult<any> | ErrorResult<E>>;
	undoError?: (ctx: Ctx) => MaybePromise<SuccessResult<any> | ErrorResult<E>>;
};

/**
 * Creates a normalized pipeline step.
 *
 * Callbacks may return void, raw values, SuccessResult, or ErrorResult.
 * void becomes SuccessResult<void>; raw values become SuccessResult<value>.
 *
 * executeError defaults to undo.
 * undoError defaults to execute.
 */
export function pipelineStep<Ctx, R = void, E extends Error = Error>(
	execute: (ctx: Ctx) => MaybePromise<PipelineStepReturn<R, E>>,
	undo: (ctx: Ctx) => MaybePromise<PipelineStepReturn<R, E>>,
	executeError?: (ctx: Ctx) => MaybePromise<PipelineStepReturn<any, E>>,
	undoError?: (ctx: Ctx) => MaybePromise<PipelineStepReturn<any, E>>
): PipelineStep<Ctx, R, E> {
	const normalizedExecute = async (ctx: Ctx) => {
		return toStepResult<R, E>(await execute(ctx));
	};

	const normalizedUndo = async (ctx: Ctx) => {
		return toStepResult<R, E>(await undo(ctx));
	};

	return {
		execute: normalizedExecute,
		undo: normalizedUndo,
		executeError: executeError ? async (ctx) => toStepResult<any, E>(await executeError(ctx)) : normalizedUndo,
		undoError: undoError ? async (ctx) => toStepResult<any, E>(await undoError(ctx)) : normalizedExecute
	};
}

function isResultObject(value: unknown): value is ResultLike {
	return typeof value === 'object' && value !== null && 'ok' in value && typeof value.ok === 'boolean';
}

function toStepResult<R, E extends Error>(value: PipelineStepReturn<R, E>): SuccessResult<R> | ErrorResult<E> {
	if (isResultObject(value)) {
		return value.ok ? (value as SuccessResult<R>) : (value as ErrorResult<E>);
	}

	if (value === undefined) {
		return pipelineSuccessResult() as SuccessResult<R>;
	}

	return pipelineSuccessResult(value) as SuccessResult<R>;
}
