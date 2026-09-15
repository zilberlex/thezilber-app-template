import { navigationStateManager } from '../state/navigation-state.svelte';
import { safeInstanceOf } from '../types/type-utils';
import type { FocusableElement } from '$lib/packages/keyboard-navigation/types';
import type { ElementInteraction } from '$lib/packages/interactions/types';
import { createAddTempCssClassCommand } from '$lib/packages/core';
import type { Command } from '$lib/packages/core';
import { TTLMap } from '$lib/packages/core';
import { engineHotkeysConfig } from './hotkey-config';
import { nativeElementInteraction } from '$lib/packages/interactions/triggers/elements/element-interactions';
const allClickTempCssCommands = new TTLMap<HTMLElement, Command[]>(1000 * 60 * 5);
const BUTTON_PRESSED_DURATION = engineHotkeysConfig.buttonClickPressedCssDurationMs;
const BUTTON_RAPID_FIRE_COOLDOWN = engineHotkeysConfig.buttonRapidFireCooldownMs;

export const engineElementInteraction: ElementInteraction = {
	focus: engineFocus,
	click: engineClick,
	blur: nativeElementInteraction.blur
};

export function engineFocus(node: FocusableElement) {
	navigationStateManager.setKeyboardNavigationMode();
	node.focus({ preventScroll: true });
	node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	const textElement = safeInstanceOf(node, HTMLInputElement, HTMLTextAreaElement);
	textElement?.select();
}

function engineClick(element: HTMLElement) {
	addClickFeedbackHelperCss(element);
	element.click();
}

function addClickFeedbackHelperCss(element: HTMLElement) {
	let btnCommands = allClickTempCssCommands.get(element);

	if (!btnCommands) {
		btnCommands = [];
		let startWorkClassCommand = createAddTempCssClassCommand(element, 'btn-start-work', BUTTON_RAPID_FIRE_COOLDOWN);
		btnCommands.push(startWorkClassCommand);
		let btnPressedClassCommand = createAddTempCssClassCommand(element, 'btn-pressed', BUTTON_PRESSED_DURATION);
		btnCommands.push(btnPressedClassCommand);
		allClickTempCssCommands.set(element, btnCommands);
	}

	btnCommands.forEach((cmd) => cmd.execute());
}
