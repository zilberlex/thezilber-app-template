import { createSmartHandler } from '$lib/engine/events/event-handling';
import { hotKeysModule } from '../hotkeys/hotkey-module';
import type { KeyboardEventKeyType, KeyCheckFn } from '$lib/engine/hotkeys/key-identification';
import { shouldIgnoreHotKey } from '../hotkeys/bl-events';
import { HotKey } from '../hotkeys/hotkey-class';
import { HotkeyTooltipAttribute } from '../hotkey-tooltip/tooltip-consts';
import { chain } from '../general-js-ts/chain-funcs';
import type { Attachment } from 'svelte/attachments';
import { engineHotkeysConfig } from './hotkey-config';
import { engineElementInteraction } from './engine-interactions';
import { assignHotkeyToClick, assignHotkeyToFocus } from '../hotkeys/svelt-components/hotkey-attachments';

const HOTKEY_COOLDOWN_MS = engineHotkeysConfig.buttonRapidFireCooldownMs;

type ButtonHotKeyOptions = {
	scope?: HTMLElement;
	prioritizeInputFieldDefaults?: boolean;
};

export function createHotKeyTriggerFocusAttachment(
	hotKeyTooltipText: string = '',
	hotKey: HotKey,
	options?: ButtonHotKeyOptions
): Attachment {
	const hotkeyToFocusAttachment = assignHotkeyToFocus(hotKey, engineElementInteraction, options);

	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		assignHotKeyTooltip(node, hotKey, hotKeyTooltipText);

		return hotkeyToFocusAttachment(node);
	};
}

export function createHotKeyTriggerClickAttachment(
	hotKeyTooltipText: string = '',
	hotKey: HotKey,
	options?: ButtonHotKeyOptions,
	moveFocus: boolean = false
): Attachment {
	const hotkeyClickAttachment = assignHotkeyToClick(hotKey, engineElementInteraction, {
		moveFocus: moveFocus,
		...options
	});

	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		assignHotKeyTooltip(node, hotKey, hotKeyTooltipText);

		return hotkeyClickAttachment(node);
	};
}

function assignHotKeyTooltip(node: Element, key: HotKey, tooltipText: string) {
	node.setAttribute(HotkeyTooltipAttribute, `${tooltipText} (${key.toString()})`);
}
