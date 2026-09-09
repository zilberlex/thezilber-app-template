import type { Attachment } from 'svelte/attachments';
import type { HotKey } from '../hotkey-class';
import { hotKeysModule } from '../hotkey-module';
import type { ElementInteraction } from '$lib/engine/interactions/types';
import type { ButtonHotKeyOptions } from '../types';
import { createHotKeyTriggerClickHandler, createHotKeyTriggerFocusHandler } from '../hotkey-handlers';

export function assignHotkeyToClick(
	hotKey: HotKey,
	elementInteraction: ElementInteraction,
	options: ButtonHotKeyOptions = {
		prioritizeInputFieldDefaults: true,
		moveFocus: false
	}
): Attachment {
	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let clickHandler = createHotKeyTriggerClickHandler(nodeElement, elementInteraction, options);
		hotKeysModule.assignHotKey(hotKey, clickHandler);

		return () => {
			hotKeysModule.removeHotKey(hotKey, clickHandler);
		};
	};
}

export function assignHotkeyToFocus(
	hotKey: HotKey,
	elementInteraction: ElementInteraction,
	options: ButtonHotKeyOptions = {
		prioritizeInputFieldDefaults: true,
		moveFocus: false
	}
): Attachment {
	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let focusHandler = createHotKeyTriggerFocusHandler(nodeElement, elementInteraction, options);
		hotKeysModule.assignHotKey(hotKey, focusHandler);

		return () => {
			hotKeysModule.removeHotKey(hotKey, focusHandler);
		};
	};
}
