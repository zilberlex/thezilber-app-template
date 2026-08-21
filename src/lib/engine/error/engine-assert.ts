import { engineError } from './engine-error';

export function engineAssert(condition: unknown, message: string, context?: unknown) {
	if (!condition) {
		engineError(message, context);
	}
}
