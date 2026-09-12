import type { SmartHandlerOptions } from './types';

export function createSmartHandler<E extends Event>(
	handler: (e: E) => void | Promise<void>,
	options: SmartHandlerOptions<E> = {}
): (e: E) => void {
	const {
		debounceDelay = 0,
		cooldownDelay = 0,
		context,
		shouldPreventDefault = true,
		shouldExecuteFunction = () => true
	} = options;

	let smartHandler = createSmartHandlerInternal(
		handler,
		debounceDelay,
		cooldownDelay,
		shouldPreventDefault,
		shouldExecuteFunction
	);

	// Improving readabilty
	smartHandler.toString = function () {
		return (
			`Smart Handler. Params: ${JSON.stringify({ debounceDelay, cooldownDelay, shouldPreventDefault })}. Context [${context}]. for handler:` +
			handler.toString()
		);
	};

	return smartHandler;
}

export function requestAnimationFrameThrottle<Args extends unknown[]>(callback: (...args: Args) => void) {
	let ticking = false;
	let lastArgs: Args;

	return (...args: Args) => {
		lastArgs = args;

		if (ticking) return;

		ticking = true;

		requestAnimationFrame(() => {
			try {
				callback(...lastArgs);
			} finally {
				ticking = false;
			}
		});
	};
}

function createSmartHandlerInternal<E extends Event>(
	handler: (event: E) => void | Promise<void>,
	debounceDelay: number,
	cooldownDelay: number,
	shouldPreventDefault: boolean,
	shouldExecuteFunction: (event: E) => boolean
): (event: E) => void {
	let debounceTimeoutId: ReturnType<typeof setTimeout> | undefined;
	let cooldown = false;
	let isProcessing = false;

	return function (this: unknown, event: E) {
		if (!shouldExecuteFunction(event)) return;

		if (debounceTimeoutId !== undefined) {
			clearTimeout(debounceTimeoutId);
		}

		if (shouldPreventDefault) {
			event.preventDefault();
		}

		debounceTimeoutId = setTimeout(async () => {
			if (cooldown || isProcessing) {
				return;
			}

			isProcessing = true;
			cooldown = true;

			setTimeout(() => {
				cooldown = false;
			}, cooldownDelay);

			try {
				await handler.call(this, event);
			} finally {
				isProcessing = false;
			}
		}, debounceDelay);
	};
}
