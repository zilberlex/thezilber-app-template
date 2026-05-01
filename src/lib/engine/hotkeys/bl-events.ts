import { createSmartHandler } from '../events/event-handling';
import { signalClickHotkeyEvent } from './bl-hotkeys-event-signals';
import { GO_KEYS } from './hotkey-groups';
import {
	ArrowKeysArray,
	NavigationKeyConsts,
	NodesWhichTakePriorityOverSoftHotKeys
} from './consts';
import type { NavType } from './types';
import { HotKey } from './hotkey-class';
export type KeyboardEventHandler = (keyboardEvent: KeyboardEvent) => void;

export function createOnGoClickHandler(onActionEventHandler: KeyboardEventHandler) {
	let smartClickHandling = createKeyabordNavigationEventHandler(onActionEventHandler);

	return async function (event: KeyboardEvent) {
		// TODO create better infra for relevancy -> preventdefault -> cd+debounce creation
		if (isKeyboardGoEvent(event)) {
			await smartClickHandling.call(this, event);

			let target = null;
			if (event.target instanceof HTMLElement) target = event.target;
			signalClickHotkeyEvent(event.key, target);
		}
	};
}

export function createKeyabordNavigationEventHandler(
	handler: KeyboardEventHandler,
	strength: 'soft' | 'hard' = 'soft'
) {
	return createSmartHandler(handler, {
		cooldownDelay: 20,
		shouldExecuteFunction: (event) => !shouldIgnoreHotKey(event, strength)
	});
}

export function createKeyboardNavigationEventHandlerMixedSoftness(
	handler: KeyboardEventHandler,
	softKeys: HotKey[],
	hardKeys: HotKey[]
) {
	let shouldExecuteFunction = (event: Event) =>
		!shouldIgnoreHotkeyPrecise(
			event as KeyboardEvent,
			HotKey.fromEvent(event as KeyboardEvent),
			softKeys,
			hardKeys
		);

	return createSmartHandler(handler, {
		cooldownDelay: 20,
		shouldExecuteFunction
	});
}

export function isKeyboardGoEvent(event: KeyboardEvent) {
	return GO_KEYS.includes(event.key.toLowerCase());
}

function shouldIgnoreHotkeyPrecise(
	event: KeyboardEvent,
	eventKey: HotKey,
	softKeys: HotKey[],
	hardKeys: HotKey[]
) {
	let hardMatch = eventKey.pickBestMatchingKey(hardKeys);

	if (hardMatch) {
		return true;
	}

	let softMatch = eventKey.pickBestMatchingKey(softKeys);

	if (softMatch) {
		return shouldIgnoreHotKey(event, 'soft');
	}

	return false;
}

export function shouldIgnoreHotKey(event: KeyboardEvent, strength: 'soft' | 'hard') {
	if (strength === 'hard') return false;
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
