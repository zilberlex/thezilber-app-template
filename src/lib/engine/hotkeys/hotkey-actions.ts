import { createSmartHandler } from '$lib/engine/events/event-handling';
import { hotKeysModule } from './hotkey-module';
import { keyBoardFocusNavigatedNode } from '../keyboard-navigation/navigation-utils';
import { signalClickHotkeyEvent, signalFocusHotkeyEvent } from './bl-hotkeys-event-signals';
import type { KeyboardEventKeyType, KeyCheckFn } from '$lib/engine/hotkeys/key-identification';
import { engineHotkeysConfig } from './hotkey-module-config';
import { shouldIgnoreHotKey } from './bl-events';
import { HotKey } from './hotkey-class';
import { HotkeyTooltipAttribute } from '../hotkey-tooltip/tooltip-consts';
import { chain } from '../general-js-ts/chain-funcs';
import type { Attachment } from 'svelte/attachments';

const HOTKEY_COOLDOWN_MS = engineHotkeysConfig.buttonRapidFireCooldownMs;

type ButtonHotKeyOptions = {
	scope?: HTMLElement;
	prioritizeInputFieldDefaults?: boolean;
};

export function createFocusHotKeyAttachment(
	hotKeyTooltipText: string = '',
	hotKey: HotKey,
	options?: ButtonHotKeyOptions
): Attachment {
	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let focusHandler = createFocusHandler(nodeElement, hotKey, options);
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

function createShouldExecuteFunction(options?: ButtonHotKeyOptions) {
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

export function createClickHotKeyAttachment(
	hotKeyTooltipText: string = '',
	hotKey: HotKey,
	options?: ButtonHotKeyOptions,
	moveFocus: boolean = false
): Attachment {
	return (node) => {
		const nodeElement = node as HTMLElement;
		if (!nodeElement) throw new Error(`Expected node to be HTML Element. Node: ${node}`);

		let clickHandler = createClickHandler(nodeElement, hotKey.key, moveFocus, options);
		hotKeysModule.assignHotKey(hotKey, clickHandler);

		assignHotKeyTooltip(node, hotKey, hotKeyTooltipText);

		return () => {
			hotKeysModule.removeHotKey(hotKey, clickHandler);
		};
	};
}

export function createFocusHandler(node: HTMLElement, key: HotKey, options?: ButtonHotKeyOptions) {
	let shouldExecuteFunction = createShouldExecuteFunction(options);

	return createSmartHandler(
		(event: Event) => {
			if (event.target !== node) {
				keyBoardFocusNavigatedNode(node);
				signalFocusHotkeyEvent(key.key, node);
			}
		},
		{
			cooldownDelay: HOTKEY_COOLDOWN_MS,
			context: `focus node: [${node.toString()}]`,
			shouldExecuteFunction
		}
	);
}

export function createClickHandler(
	node: HTMLElement,
	initiatingKey: string,
	moveFocus: boolean,
	options?: ButtonHotKeyOptions
) {
	const shouldExecuteFunction = createShouldExecuteFunction(options);
	return createSmartHandler(
		(_event: Event) => {
			let currentActiveElement = document.activeElement;
			node.click();

			if (!moveFocus) {
				if (currentActiveElement instanceof HTMLElement) {
					currentActiveElement.focus();
				} else node.blur();
			}

			signalClickHotkeyEvent(initiatingKey, node);
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
