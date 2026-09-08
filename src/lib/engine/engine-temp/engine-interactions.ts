import { navigationStateManager } from '../state/navigation-state.svelte';
import { safeInstanceOf } from '../types/type-utils';
import type { FocusableElement } from '../keyboard-navigation/types';
import type { ElementInteraction } from '../interactions/types';
import { createAddTempCssClassCommand } from '../patterns/command/command-impl/add-css-class-command';
import type { Command } from '../patterns/command/command';
import { TTLMap } from '../patterns/cache';
import { engineHotkeysConfig } from './hotkey-config';
import { nativeElementInteraction } from '../interactions/triggers/elements/element-interactions';

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
	addTempClickCss(element);
	element.click();
}

function addTempClickCss(element: HTMLElement) {
	let btnCommands = allClickTempCssCommands.get(element);

	if (!btnCommands) {
		console.debug('Creating New CssCommands For Button', element);
		btnCommands = [];
		let startWorkClassCommand = createAddTempCssClassCommand(element, 'btn-start-work', BUTTON_RAPID_FIRE_COOLDOWN);
		btnCommands.push(startWorkClassCommand);

		// TODO AZ move to attributes and improve styling
		let btnPressedClassCommand = createAddTempCssClassCommand(element, 'btn-pressed', BUTTON_PRESSED_DURATION);
		btnCommands.push(btnPressedClassCommand);

		allClickTempCssCommands.set(element, btnCommands);
	}

	btnCommands.forEach((cmd) => cmd.execute());
}
