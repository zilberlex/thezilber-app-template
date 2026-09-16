import type { KeyboardEventHandler } from 'svelte/elements';
import { createSmartHandler, KbKey } from '$lib/packages/core';
import type { ElementInteraction } from '$lib/packages/interactions';
import { NodesWhichTakePriorityOverSoftHotKeys } from './consts';
import type { HotKeyToTriggerClickOptions, HotKeyToTriggerOptions } from './types';

const BUTTON_RAPID_FIRE_COOLDOWN_DEFAULT = 20;

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

export function createHotKeyHandler(
	handler: KeyboardEventHandler<any>,
	options: HotKeyToTriggerOptions = { prioritizeInputFieldDefaults: true }
) {
	return createSmartHandler(handler, {
		cooldownDelay: 20,
		shouldExecuteFunction: createHotKeyShouldExecuteFunction(options)
	});
}

function createHotKeyShouldExecuteFunction(options: HotKeyToTriggerOptions) {
	return (e: KeyboardEvent) => shouldExecuteHotKeyHandler(e, options);
}

export function shouldExecuteHotKeyHandler(event: KeyboardEvent, options: HotKeyToTriggerOptions) {
	let eventTarget = event.target as HTMLElement;

	let key = KbKey.fromEvent(event);

	if (key.alt || key.ctrlOrMeta) {
		return true;
	}

	if (eventTarget && options.prioritizeInputFieldDefaults) {
		return !NodesWhichTakePriorityOverSoftHotKeys.includes(eventTarget.tagName.toLowerCase());
	}

	return true;
}
