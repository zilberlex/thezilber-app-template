import type { MaybePromise } from '$lib/engine/general-js-ts/typescript/type-helpers';
import type { ErrorResult, PipelineStep, ResultLike, SuccessResult } from './types';

type PipelineStepReturn<R, E extends Error> = [R] extends [void]
	? void | SuccessResult<void> | ErrorResult<E>
	: R | SuccessResult<R> | ErrorResult<E>;

export function pipelineSuccessResult<T = void>(value?: T): SuccessResult<T> {
	return (arguments.length === 0 ? { ok: true } : { ok: true, value }) as SuccessResult<T>;
}

export function pipelineFailResult<E extends Error>(e: E): ErrorResult<E> {
	return { ok: false, error: e };
}

/**
 * Creates a normalized pipeline step.
 *
 * Callbacks may return void, raw values, SuccessResult, or ErrorResult.
 * void becomes SuccessResult<void>; raw values become SuccessResult<value>.
 *
 * executeError defaults to undo.
 * undoError defaults to execute.
 */
export function pipelineStep<Deps, Ctx, R = void, E extends Error = Error>(
	execute: (deps: Deps, ctx: Ctx) => MaybePromise<PipelineStepReturn<R, E>>,
	undo: (deps: Deps, ctx: Ctx) => MaybePromise<PipelineStepReturn<R, E>>,
	executeError?: (deps: Deps, ctx: Ctx) => MaybePromise<PipelineStepReturn<any, E>>,
	undoError?: (deps: Deps, ctx: Ctx) => MaybePromise<PipelineStepReturn<any, E>>
): PipelineStep<Deps, Ctx, R, E> {
	const normalizedExecute = async (deps: Deps, ctx: Ctx) => {
		return toStepResult<R, E>(await execute(deps, ctx));
	};

	const normalizedUndo = async (deps: Deps, ctx: Ctx) => {
		return toStepResult<R, E>(await undo(deps, ctx));
	};

	return {
		execute: normalizedExecute,
		undo: normalizedUndo,
		executeError: executeError
			? async (deps, ctx) => toStepResult<any, E>(await executeError(deps, ctx))
			: normalizedUndo,
		undoError: undoError ? async (deps, ctx) => toStepResult<any, E>(await undoError(deps, ctx)) : normalizedExecute
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
