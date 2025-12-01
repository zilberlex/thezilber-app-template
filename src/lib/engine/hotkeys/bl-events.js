import { createSmartHandler } from '../../events/eventHandling';
import { signalClickHotkeyEvent } from './bl-hotkeys-event-signals';
import { GO_KEYS } from './hotkey-groups';

/**
 * @param {function(KeyboardEvent): void} onActionEventHandler
 * @returns {function(KeyboardEvent)}
 */
export function createOnGoClickHandler(onActionEventHandler) {
	let smartClickHandling = createKeyabordNavigationEvent(onActionEventHandler);

	/** @param {KeyboardEvent} event */
	return async function (event) {
		// TODO create better infra for relevancy -> preventdefault -> cd+debounce creation
		if (isKeyboardGoEvent(event)) {
			await smartClickHandling.call(this, event);
			signalClickHotkeyEvent(event.key, event.target);
		}
	};
}

/**
 * @param {function(KeyboardEvent): void} handler
 * @returns {function(KeyboardEvent): void}
 */
export function createKeyabordNavigationEvent(handler) {
	return createSmartHandler(handler, { cooldownDelay: 20 });
}

/** @param {KeyboardEvent} event */
function isKeyboardGoEvent(event) {
	return GO_KEYS.includes(event.key.toLowerCase());
}
