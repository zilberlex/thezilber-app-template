import { createSmartHandler } from '../events/event-handling';
import type { ElementInteraction } from '../interactions/types';
import { NodesWhichTakePriorityOverSoftHotKeys } from './consts';
import { HotKey } from './hotkey-class';
import type { HotKeyToTriggerClickOptions, HotKeyToTriggerOptions } from './types';

const BUTTON_RAPID_FIRE_COOLDOWN_DEFAULT = 20;

function alwaysTrue() {
	return true;
}

export function createHotKeyTriggerClickHandler(
	node: HTMLElement,
	elementInteraction: ElementInteraction,
	options: HotKeyToTriggerClickOptions
) {
	const { moveFocus } = options;

	const shouldExecuteFunction = createHotKeyShouldExecuteFunction(options);
	return createSmartHandler(
		(_event: Event) => {
			let currentActiveElement = document.activeElement;
			elementInteraction.click(node);

			if (!moveFocus) {
				if (currentActiveElement && currentActiveElement instanceof HTMLElement) {
					elementInteraction.focus(currentActiveElement);
				} else elementInteraction.blur(node);
			} else elementInteraction.focus(node);
		},
		{
			cooldownDelay: BUTTON_RAPID_FIRE_COOLDOWN_DEFAULT,
			context: `click node: [${node.toString()}]`,
			shouldExecuteFunction
		}
	);
}

export function createHotKeyTriggerFocusHandler(
	node: HTMLElement,
	elementInteraction: ElementInteraction,
	options: HotKeyToTriggerOptions
) {
	let shouldExecuteFunction = createHotKeyShouldExecuteFunction(options);

	return createSmartHandler(
		(event: Event) => {
			if (event.target !== node) {
				elementInteraction.focus(node);
			}
		},
		{
			cooldownDelay: BUTTON_RAPID_FIRE_COOLDOWN_DEFAULT,
			context: `focus node: [${node.toString()}]`,
			shouldExecuteFunction
		}
	);
}

function createHotKeyShouldExecuteFunction(options: HotKeyToTriggerOptions) {
	let { prioritizeInputFieldDefaults } = options;
	let funcs: ((e: KeyboardEvent) => boolean)[] = [];

	let prioritizeInputFieldDefaultsCheck: (e: KeyboardEvent) => boolean = prioritizeInputFieldDefaults
		? (e: KeyboardEvent) => !shouldIgnoreHotKey(e, 'soft')
		: alwaysTrue;
	funcs.push(prioritizeInputFieldDefaultsCheck);

	return prioritizeInputFieldDefaultsCheck;
}

export function shouldIgnoreHotKey(event: KeyboardEvent, strength: 'soft' | 'hard') {
	let key = HotKey.fromEvent(event);
	let currentActiveElement = document.activeElement;

	if (strength === 'hard' || key.alt || key.ctrlOrOption || !currentActiveElement) return false;
	let element = currentActiveElement as HTMLElement;
	return strength === 'soft' && NodesWhichTakePriorityOverSoftHotKeys.includes(element.tagName.toLowerCase());
}
