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

export function pipelineStepSuccess<T = void>(value?: T): SuccessResult<T> {
	return (arguments.length === 0 ? { ok: true } : { ok: true, value }) as SuccessResult<T>;
}

export type MaybePromise<T> = T | Promise<T>;

export type PipelineStep<Ctx, R = void, E extends Error = Error> = {
	execute: (ctx: Ctx) => MaybePromise<SuccessResult<R>>;
	undo: (ctx: Ctx) => MaybePromise<SuccessResult<R> | ErrorResult<E>>;
	executeError: (ctx: Ctx) => MaybePromise<SuccessResult<any> | ErrorResult<E>>;
	undoError?: (ctx: Ctx) => MaybePromise<SuccessResult<any> | ErrorResult<E>>;
};

export function pipelineStep<Ctx, R = void, E extends Error = Error>(
	execute: (ctx: Ctx) => MaybePromise<SuccessResult<R>>,
	undo: (ctx: Ctx) => MaybePromise<SuccessResult<R> | ErrorResult<E>>,
	executeError?: (ctx: Ctx) => MaybePromise<SuccessResult<any> | ErrorResult<E>>,
	undoError?: (ctx: Ctx) => MaybePromise<SuccessResult<any> | ErrorResult<E>>
): PipelineStep<Ctx, R, E> {
	return {
		execute,
		undo,
		executeError: executeError ?? undo,
		undoError: undoError ?? execute
	};
}
