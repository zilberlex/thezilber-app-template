import { createSmartHandler } from '../events/event-handling';
import { signalClickHotkeyEvent } from './bl-hotkeys-event-signals';
import { GO_KEYS } from './hotkey-groups';
import {
	ArrowKeysArray,
	NavigationKeyConsts,
	NodesWhichTakePriorityOverSoftHotKeys,
	type NavType
} from './consts';

/**
 * @param {function(KeyboardEvent): void} onActionEventHandler
 * @returns {function(KeyboardEvent)}
 */
export function createOnGoClickHandler(onActionEventHandler) {
	let smartClickHandling = createKeyabordNavigationEventHandler(onActionEventHandler);

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
export function createKeyabordNavigationEventHandler(handler) {
	return createSmartHandler(handler, {
		cooldownDelay: 20,
		shouldExecuteFunction: (event) => !shouldIgnoreHotKey(event)
	});
}

/** @param {KeyboardEvent} event */
export function isKeyboardGoEvent(event) {
	return GO_KEYS.includes(event.key.toLowerCase());
}

export function shouldIgnoreHotKey(event: KeyboardEvent) {
	let element = event.target as HTMLElement;
	let navType = GetNavType(event);
	return (
		navType.strength === 'soft' &&
		NodesWhichTakePriorityOverSoftHotKeys.includes(element.tagName.toLowerCase())
	);
}

export function GetNavType(event: KeyboardEvent): NavType {
	const key = event.key;

	const direction =
		key === NavigationKeyConsts.ArrowLeft
			? 'hor-prev'
			: key === NavigationKeyConsts.ArrowRight
				? 'hor-next'
				: key === NavigationKeyConsts.ArrowUp
					? 'ver-prev'
					: key === NavigationKeyConsts.ArrowDown
						? 'ver-next'
						: undefined;

	const strength = event.altKey ? 'hard' : 'soft';

	const isArrow = ArrowKeysArray.includes(key);

	return {
		direction,
		strength,
		isArrow
	};
}
