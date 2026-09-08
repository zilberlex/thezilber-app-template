import type { Attachment } from 'svelte/attachments';
import type { HotKey } from '../hotkey-class';
import { hotKeysModule } from '../hotkey-module';
import { createSmartHandler } from '$lib/engine/events/event-handling';
import type { ElementInteraction } from '$lib/engine/interactions/types';
import { shouldIgnoreHotKey } from '../bl-events';

type ButtonHotKeyOptions = {
	prioritizeInputFieldDefaults?: boolean;
	moveFocus?: boolean;
};

function alwaysTrue() {
	return true;
}

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

export function createHotKeyTriggerClickHandler(
	node: HTMLElement,
	elementInteraction: ElementInteraction,
	options: ButtonHotKeyOptions
) {
	const { moveFocus } = options;

	const shouldExecuteFunction = createHotKeyShouldExecuteFunction(options);
	return createSmartHandler(
		(_event: Event) => {
			let currentActiveElement = document.activeElement;
			elementInteraction.click(node);

			if (!moveFocus) {
				if (currentActiveElement instanceof HTMLElement) {
					elementInteraction.focus(currentActiveElement);
				} else node.blur();
			}
		},
		{
			cooldownDelay: 20,
			context: `click node: [${node.toString()}]`,
			shouldExecuteFunction
		}
	);
}

function createHotKeyShouldExecuteFunction(options: ButtonHotKeyOptions) {
	let { prioritizeInputFieldDefaults } = options;
	let funcs: ((e: KeyboardEvent) => boolean)[] = [];

	let prioritizeInputFieldDefaultsCheck: (e: KeyboardEvent) => boolean = prioritizeInputFieldDefaults
		? (e: KeyboardEvent) => !shouldIgnoreHotKey(e, 'soft')
		: alwaysTrue;
	funcs.push(prioritizeInputFieldDefaultsCheck);

	return prioritizeInputFieldDefaultsCheck;
}
