import { createSmartHandler } from '../events/event-handling';
import { isKeyboardGoEvent } from './bl-events';
import { engineHotkeysConfig, type TriggerType } from './hotkey-module-config';
import type { Command } from '$lib/engine/patterns/command/command';
import { TTLMap } from '$lib/engine/patterns/cache';
import { createAddTempCssClassCommand } from '$lib/engine/patterns/command/command-impl/add-css-class-command';

const BUTTON_RAPID_FIRE_COOLDOWN = engineHotkeysConfig.buttonRapidFireCooldownMs;
const BUTTON_PRESSED_DURATION = engineHotkeysConfig.buttonClickPressedCssDurationMs;

const allBtnCommands = new TTLMap<HTMLButtonElement, Command[]>(1000 * 60 * 5);

export const createEngineButtonClickOnKeyDownHandler = () =>
	createSmartHandler(
		(event: KeyboardEvent) => {
			const btn = event.target as HTMLButtonElement;

			btn.click();
		},
		{
			cooldownDelay: BUTTON_RAPID_FIRE_COOLDOWN,
			shouldExecuteFunction: isKeyboardGoEvent,
			shouldPreventDefault: true
		}
	);

// Improve this - This should create a wrapper to a handler.
export const createEngineButtonOnClickHandler = () =>
	createSmartHandler(
		(event: KeyboardEvent) => {
			const btn = event.target as HTMLButtonElement;
			btnClickCssFlow(btn);
		},
		{
			cooldownDelay: BUTTON_RAPID_FIRE_COOLDOWN,
			shouldPreventDefault: true
		}
	);

function btnClickCssFlow(btn: HTMLButtonElement, triggerType: TriggerType = 'KEY_DOWN') {
	let btnCommands = allBtnCommands.get(btn);

	if (!btnCommands) {
		console.log('Creating New CssCommands For Button', btn);
		btnCommands = [];
		let startWorkClassCommand = createAddTempCssClassCommand(
			btn,
			'btn-start-work',
			BUTTON_RAPID_FIRE_COOLDOWN
		);
		btnCommands.push(startWorkClassCommand);
		if (triggerType == 'KEY_DOWN') {
			let btnPressedClassCommand = createAddTempCssClassCommand(
				btn,
				'btn-pressed',
				BUTTON_PRESSED_DURATION
			);

			btnCommands.push(btnPressedClassCommand);
		}

		allBtnCommands.set(btn, btnCommands);
	}

	btnCommands.forEach((cmd) => cmd.execute());
}
