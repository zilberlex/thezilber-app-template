import { createSmartHandler } from '$lib/engine/events/event-handling';
import type { Attachment } from 'svelte/attachments';
import { hotKeysModule } from './hotkey-module';
import { keyBoardFocusNavigatedNode } from '../keyboard-navigation/navigation-utils';
import { signalClickHotkeyEvent, signalFocusHotkeyEvent } from './bl-hotkeys-event-signals';
import type {
	KeyboardEventKeyType,
	KeyCheckFn
} from '$lib/general-components/hotkeys/key-identification';
import { engineHotkeysConfig } from './hotkey-module-config';

const HOTKEY_COOLDOWN_MS = engineHotkeysConfig.buttonRapidFireCooldownMs;

export function createFocusHotKeyAction(node: HTMLElement, hotKey: string) {
	// graceful handling of no hotkey.
	if (!hotKey) return;

	let focusHandler = createFocusHandler(node, hotKey);

	hotKeysModule.assignHotKey(hotKey, focusHandler);

	return {
		destroy: () => {
			hotKeysModule.removeHotKey(hotKey, focusHandler);
		}
	};
}

export function createFocusHandler(node: HTMLElement, key: string) {
	return createSmartHandler(
		(event: Event) => {
			if (event.target !== node) {
				keyBoardFocusNavigatedNode(node);
				signalFocusHotkeyEvent(key, node);
			}
		},
		{ cooldownDelay: HOTKEY_COOLDOWN_MS, context: `focus node: [${node.toString()}]` }
	);
}

export function createClickHandler(node: HTMLElement, initiatingKey: string) {
	return createSmartHandler(
		(_event: Event) => {
			node.click();
			signalClickHotkeyEvent(initiatingKey, node);
		},
		{ cooldownDelay: HOTKEY_COOLDOWN_MS, context: `click node: [${node.toString()}]` }
	);
}

export function createOnKeyDownHandler(
	node: Element,
	keys: KeyboardEventKeyType,
	handler: (e: KeyboardEvent) => void
) {
	return createSmartHandler(
		(event: KeyboardEvent) => {
			handler(event);
		},
		{
			cooldownDelay: HOTKEY_COOLDOWN_MS,
			context: `OnKeyDown handler node: [${node.toString()}]`,
			shouldExecuteFunction: createOnKeyDownHandler_CreateShouldExcuteFunction(keys)
		}
	);
}

function createOnKeyDownHandler_CreateShouldExcuteFunction(keys: KeyboardEventKeyType) {
	return (event: KeyboardEvent) => {
		let keysArray: (string | KeyCheckFn)[];
		if (!Array.isArray(keys)) {
			keysArray = [keys];
		} else {
			keysArray = keys;
		}

		const eventKey = event.key;

		return keysArray.some((keyCheck) => {
			if (typeof keyCheck === 'function') {
				return keyCheck(event);
			}

			return eventKey === keyCheck;
		});
	};
}

export function createHotKeyForButtonClick(hotKey: string): Attachment {
	return (node) => {
		const nodeElement = node as HTMLElement;

		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let clickHandler = createClickHandler(nodeElement, hotKey);
		hotKeysModule.assignHotKey(hotKey, clickHandler);

		return () => {
			hotKeysModule.removeHotKey(hotKey, clickHandler);
		};
	};
}
