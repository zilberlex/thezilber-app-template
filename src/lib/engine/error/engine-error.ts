export class EngineError extends Error {
	readonly context?: unknown;

	constructor(message: string, context?: unknown) {
		super(message);

		this.name = 'EngineError';
		this.context = context;
	}
}

export function engineError(message: string, context?: unknown): never {
	throw new EngineError(message, context);
}

export function reportEngineError(error: EngineError) {
	console.error('[EngineError] Context:', error.context, '\nError:\n', error);
}
