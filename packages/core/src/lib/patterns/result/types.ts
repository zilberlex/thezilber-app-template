export type ResultLike = {
	ok: boolean;
};

export type Result<T = void, E extends Error = Error> = SuccessResult<T> | ErrorResult<E>;

export type MaybeResult<T, E extends Error = Error> = T extends ResultLike ? T : T | Result<T, E>;

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
