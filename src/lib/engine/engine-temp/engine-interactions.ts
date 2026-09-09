import { navigationStateManager } from '../state/navigation-state.svelte';
import { safeInstanceOf } from '../types/type-utils';
import type { FocusableElement } from '../keyboard-navigation/types';
import type { ElementInteraction } from '../interactions/types';
import { createAddTempCssClassCommand } from '../patterns/command/command-impl/add-css-class-command';
import type { Command } from '../patterns/command/command';
import { TTLMap } from '../patterns/cache';
import { engineHotkeysConfig } from './hotkey-config';

const allClickTempCssCommands = new TTLMap<HTMLElement, Command[]>(1000 * 60 * 5);

const BUTTON_PRESSED_DURATION = engineHotkeysConfig.buttonClickPressedCssDurationMs;
const BUTTON_RAPID_FIRE_COOLDOWN = engineHotkeysConfig.buttonRapidFireCooldownMs;

export const engineElementInteraction: ElementInteraction = {
	focus: engineFocus,
	click: engineClick,
  blur(element)
}
