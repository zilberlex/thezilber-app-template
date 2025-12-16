import { createSmartHandler } from '$lib/engine/events/event-handling';
import type { Attachment } from 'svelte/attachments';
import { hotKeysModule } from './hotkey-module';
import { keyBoardFocusNavigatedNode } from '../keyboard-navigation/navigation-utils';
import { signalClickHotkeyEvent, signalFocusHotkeyEvent } from './bl-hotkeys-event-signals';
import type { KeyboardEventKeyType, KeyCheckFn } from '$lib/engine/hotkeys/key-identification';
import { engineHotkeysConfig } from './hotkey-module-config';
import { shouldIgnoreHotKey } from './bl-events';
import type { HotKeyModifier } from './types';
import { HotKey } from './hotkey-class';
import { HotkeyTooltipAttribute } from '../tooltip/tooltip-consts';

const HOTKEY_COOLDOWN_MS = engineHotkeysConfig.buttonRapidFireCooldownMs;

export function createFocusHotKeyAttachment(
	hotKeyTooltipText: string = '',
	key: string,
	...modifiers: HotKeyModifier[]
): Attachment {
	const hotKey = new HotKey(key, ...modifiers);

	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let focusHandler = createFocusHandler(nodeElement, hotKey);
		hotKeysModule.assignHotKey(hotKey, focusHandler);

		assignHotKeyTooltip(node, hotKey, hotKeyTooltipText);

		return () => {
			hotKeysModule.removeHotKey(hotKey, focusHandler);
		};
	};
}

export function createClickHotKeyAttachment(
	hotKeyTooltipText: string = '',
	key: string,
	...modifiers: HotKeyModifier[]
): Attachment {
	const hotKey = new HotKey(key, ...modifiers);

	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let clickHandler = createClickHandler(nodeElement, hotKey.key);
		hotKeysModule.assignHotKey(hotKey, clickHandler);

		assignHotKeyTooltip(node, hotKey, hotKeyTooltipText);

		return () => {
			hotKeysModule.removeHotKey(hotKey, clickHandler);
		};
	};
}

export function createFocusHandler(node: HTMLElement, key: HotKey) {
	return createSmartHandler(
		(event: Event) => {
			if (event.target !== node) {
				keyBoardFocusNavigatedNode(node);
				signalFocusHotkeyEvent(key.key, node);
			}
		},
		{
			cooldownDelay: HOTKEY_COOLDOWN_MS,
			context: `focus node: [${node.toString()}]`,
			shouldExecuteFunction: (e) => !shouldIgnoreHotKey(e as KeyboardEvent)
		}
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
	return (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		let keysArray: (string | KeyCheckFn)[];
		if (!Array.isArray(keys)) {
			keysArray = [keys];
		} else {
			keysArray = keys;
		}

		const eventKey = keyboardEvent.key;

		return keysArray.some((keyCheck) => {
			if (typeof keyCheck === 'function') {
				return keyCheck(keyboardEvent);
			}

			return eventKey === keyCheck;
		});
	};
}

function assignHotKeyTooltip(node: Element, key: HotKey, tooltipText: string) {
	node.setAttribute(HotkeyTooltipAttribute, `${tooltipText} (${key.toString()})`);
}
