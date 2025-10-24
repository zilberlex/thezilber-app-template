import { FOCUS_HOTKEY_COOLDOWN_MS } from '$lib/engine/configuration/constants';
import { createSmartHandler } from '$lib/engine/events/event-handling';
import {
	signalClickHotkeyEvent,
	signalFocusHotkeyEvent
} from '$lib/engine/hotkeys/bl-hotkeys-event-signals';
import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import type { Attachment } from 'svelte/attachments';

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
		{ cooldownDelay: FOCUS_HOTKEY_COOLDOWN_MS, context: `focus node: [${node.toString()}]` }
	);
}

export function createClickHandler(node: HTMLElement, initiatingKey: string) {
	return createSmartHandler(
		(_event: Event) => {
			node.click();
			signalClickHotkeyEvent(initiatingKey, node);
		},
		{ cooldownDelay: FOCUS_HOTKEY_COOLDOWN_MS, context: `click node: [${node.toString()}]` }
	);
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
