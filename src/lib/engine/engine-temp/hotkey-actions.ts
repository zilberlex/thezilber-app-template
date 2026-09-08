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
import { assignHotkeyToClick } from '../hotkeys/svelt-components/hotkey-attachments';

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
	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let focusHandler = createHotKeyTriggerFocusHandler(nodeElement, hotKey, options);
		hotKeysModule.assignHotKey(hotKey, focusHandler);

		assignHotKeyTooltip(node, hotKey, hotKeyTooltipText);

		return () => {
			hotKeysModule.removeHotKey(hotKey, focusHandler);
		};
	};
}

function alwaysTrue() {
	return true;
}

const optionsDefaults: ButtonHotKeyOptions = {
	prioritizeInputFieldDefaults: true,
	scope: undefined
};

function createHotKeyShouldExecuteFunction(options?: ButtonHotKeyOptions) {
	let { prioritizeInputFieldDefaults, scope } = options ?? optionsDefaults;
	let funcs: ((e: KeyboardEvent) => boolean)[] = [];

	let prioritizeInputFieldDefaultsCheck: (e: KeyboardEvent) => boolean = prioritizeInputFieldDefaults
		? (e: KeyboardEvent) => !shouldIgnoreHotKey(e, 'soft')
		: alwaysTrue;
	funcs.push(prioritizeInputFieldDefaultsCheck);

	let scopeCheck: (e: KeyboardEvent) => boolean = scope
		? (_e: KeyboardEvent) => {
				console.log(
					'Checking scope',
					scope,
					'activeElement',
					document.activeElement,
					'scope.contains(document.activeElement)',
					scope.contains(document.activeElement)
				);

				return scope.contains(document.activeElement);
			}
		: alwaysTrue;
	funcs.push(scopeCheck);

	let ret: (e: KeyboardEvent) => boolean = chain((b) => b.every(Boolean), ...funcs);

	return ret;
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

export function createHotKeyTriggerFocusHandler(node: HTMLElement, key: HotKey, options?: ButtonHotKeyOptions) {
	let shouldExecuteFunction = createHotKeyShouldExecuteFunction(options);

	return createSmartHandler(
		(event: Event) => {
			if (event.target !== node) {
				engineElementInteraction.focus(node);
			}
		},
		{
			cooldownDelay: HOTKEY_COOLDOWN_MS,
			context: `focus node: [${node.toString()}]`,
			shouldExecuteFunction
		}
	);
}

export function createHotKeyTriggerClickHandler(
	node: HTMLElement,
	initiatingKey: string,
	moveFocus: boolean,
	options?: ButtonHotKeyOptions
) {
	const shouldExecuteFunction = createHotKeyShouldExecuteFunction(options);
	return createSmartHandler(
		(_event: Event) => {
			let currentActiveElement = document.activeElement;
			engineElementInteraction.click(node);

			if (!moveFocus) {
				if (currentActiveElement instanceof HTMLElement) {
					engineElementInteraction.focus(currentActiveElement);
				} else node.blur();
			}
		},
		{
			cooldownDelay: HOTKEY_COOLDOWN_MS,
			context: `click node: [${node.toString()}]`,
			shouldExecuteFunction
		}
	);
}

export function createOnKeyDownHandler(node: Element, keys: KeyboardEventKeyType, handler: (e: KeyboardEvent) => void) {
	return createSmartHandler(
		(event: KeyboardEvent) => {
			handler(event);
		},
		{
			cooldownDelay: HOTKEY_COOLDOWN_MS,
			context: `OnKeyDown handler node: [${node.toString()}]`,
			shouldExecuteFunction: createOnKeyDownHandler_CreateShouldExcuteFunction(keys)
		}
	);
}

function createOnKeyDownHandler_CreateShouldExcuteFunction(keys: KeyboardEventKeyType) {
	return (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		let keysArray: (string | KeyCheckFn)[];
		if (!Array.isArray(keys)) {
			keysArray = [keys];
		} else {
			keysArray = keys;
		}

		const eventKey = keyboardEvent.key;

		return keysArray.some((keyCheck) => {
			if (typeof keyCheck === 'function') {
				return keyCheck(keyboardEvent);
			}

			return eventKey === keyCheck;
		});
	};
}

function assignHotKeyTooltip(node: Element, key: HotKey, tooltipText: string) {
	node.setAttribute(HotkeyTooltipAttribute, `${tooltipText} (${key.toString()})`);
}
