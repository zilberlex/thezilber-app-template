import type { ErrorResult, SuccessResult } from './types';

export function successResult<T = void>(value?: T): SuccessResult<T> {
	return (arguments.length === 0 ? { ok: true } : { ok: true, value }) as SuccessResult<T>;
}

export function errorResult<E extends Error>(e: E): ErrorResult<E> {
	return { ok: false, error: e };
}

export function isErrorResult(value: unknown): value is ErrorResult<Error> {
	return (
		typeof value === 'object' &&
		value !== null &&
		'ok' in value &&
		value.ok === false &&
		'error' in value &&
		value.error instanceof Error
	);
}
