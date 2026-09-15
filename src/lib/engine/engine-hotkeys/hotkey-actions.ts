import { HotkeyTooltipAttribute } from '../hotkey-tooltip/tooltip-consts';
import type { Attachment } from 'svelte/attachments';
import { engineElementInteraction } from './engine-interactions';
import { assignHotkeyToClick, assignHotkeyToFocus } from '$lib/packages/hotkey-module/svelte/hotkey-attachments';
import type { KbKey } from '$lib/packages/core';

type ButtonHotKeyOptions = {
	scope?: HTMLElement;
	prioritizeInputFieldDefaults?: boolean;
};

export function createHotKeyTriggerFocusAttachment(
	hotKeyTooltipText: string = '',
	hotKey: KbKey,
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
	hotKey: KbKey,
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

function assignHotKeyTooltip(node: Element, key: KbKey, tooltipText: string) {
	node.setAttribute(HotkeyTooltipAttribute, `${tooltipText} (${key.toString()})`);
}
