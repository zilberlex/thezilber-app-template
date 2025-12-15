/**
 * @param {function} handler
 * @param {{debounceDelay?: number, cooldownDelay?: number, context?: string, shouldPreventDefault?: boolean, shouldExecuteFunction?: (event: Event) => boolean}} options
 */
export function createSmartHandler(handler, options = {}) {
	const {
		debounceDelay = 0,
		cooldownDelay = 1500,
		context,
		shouldPreventDefault = true,
		shouldExecuteFunction = () => true
	} = options;

	if (context)
		console.debug(
			'created smart handler context. options',
			options,
			'Handler:',
			handler.toString()
		);

	let smartHandler = _createSmartHandlerInternal(
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

/**
 * @param {(...args: any[]) => void} callback
 * @returns {(...args: any[]) => void}
 */
export function requestAnimationFrameThrottle(callback) {
	let ticking = false;
	/**
	 * @type {any[]}
	 */
	let lastArgs = [];

	return (/** @type {any[]} */ ...args) => {
		lastArgs = args;

		if (ticking) return;

		ticking = true;

		window.requestAnimationFrame(() => {
			callback(...lastArgs);
			ticking = false;
		});
	};
}

/**
 * @param {function} handler
 */
function _createSmartHandlerInternal(
	handler,
	debounceDelay,
	cooldownDelay,
	shouldPreventDefault,
	shouldExecuteFunction
) {
	/**
	 * @type {number | undefined}
	 */
	let debounceTimeoutId;
	let cooldown = false;
	let isProcessing = false;

	let ret = async function (/** @type {Event} */ event) {
		if (!shouldExecuteFunction(event)) return;

		if (debounceTimeoutId) {
			window.clearTimeout(debounceTimeoutId);
		}

		if (shouldPreventDefault) {
			event?.preventDefault();
		}

		debounceTimeoutId = window.setTimeout(async () => {
			if (cooldown || isProcessing) {
				// console.debug(
				//   'handler',
				//   handler.name,
				//   'cd',
				//   cooldown,
				//   'processing',
				//   isProcessing,
				//   'handler:',
				//   handler.toString()
				// );
				return;
			}

			isProcessing = true;
			cooldown = true;
			window.setTimeout(() => {
				console.debug(
					`setting timeout for handler. Cd: [${cooldownDelay}]. handler`,
					handler.toString()
				);

				cooldown = false;
			}, cooldownDelay);

			try {
				await handler.call(this, event);
			} finally {
				isProcessing = false;
			}
		}, debounceDelay);
	};

	return ret;
}
