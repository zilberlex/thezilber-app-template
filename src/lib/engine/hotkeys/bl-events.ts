import { createSmartHandler } from '../events/event-handling';
import { ArrowKeysArray, NavigationKeyConsts, NodesWhichTakePriorityOverSoftHotKeys } from './consts';
import { GO_KEYS } from './hotkey-groups';
import type { NavType } from './types';
export type KeyboardEventHandler = (keyboardEvent: KeyboardEvent) => void;

export function createKeyabordNavigationEventHandler(
	handler: KeyboardEventHandler,
	strength: 'soft' | 'hard' = 'soft'
) {
	return createSmartHandler(handler, {
		cooldownDelay: 20,
		shouldExecuteFunction: (event: KeyboardEvent) => !shouldIgnoreHotKey(event, strength)
	});
}

export function createSoftKeyHandler(handler: KeyboardEventHandler) {
	return createSmartHandler(handler, {
		cooldownDelay: 20,
		shouldExecuteFunction: (event: KeyboardEvent) => !shouldIgnoreHotKey(event, 'soft')
	});
}

export function isKeyboardGoEvent(event: KeyboardEvent) {
	return GO_KEYS.includes(event.key.toLowerCase());
}

export function shouldIgnoreHotKey(event: KeyboardEvent, strength: 'soft' | 'hard') {
	if (strength === 'hard') return false;
	let element = event.target as HTMLElement;
	let navType = GetNavType(event);
	return navType.strength === 'soft' && NodesWhichTakePriorityOverSoftHotKeys.includes(element.tagName.toLowerCase());
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
