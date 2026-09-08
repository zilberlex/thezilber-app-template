import { createSmartHandler } from '../events/event-handling';
import { isKeyboardGoEvent } from './bl-events';
import { engineElementInteraction } from '../engine-temp/engine-interactions';
import { engineHotkeysConfig } from '../engine-temp/hotkey-config';

const BUTTON_RAPID_FIRE_COOLDOWN = engineHotkeysConfig.buttonRapidFireCooldownMs;

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
			engineElementInteraction.click(btn);
			console.log('lol1');
		},
		{
			cooldownDelay: BUTTON_RAPID_FIRE_COOLDOWN,
			shouldPreventDefault: true
		}
	);
