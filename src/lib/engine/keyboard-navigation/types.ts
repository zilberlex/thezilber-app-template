import type { DispatchHandler } from '$lib/engine/patterns/observer';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
import type { HotKey } from '../hotkeys/hotkey-class';

export function createNavigationKeys(nextKeys: string[], prevKeys: string[]): NavigationKeysConfig {
	return {
		prevKeys,
		nextKeys
	};
}

export interface NodeFocusEvent {
	targetNode: HTMLElement;
}

export interface NextNodeInfo {
	nextNode?: HTMLElement;
	escapeBackupNode?: HTMLElement;
}

export interface ScopeInfra {
	scopeName: string;
	navigationKeys: NavigationKeysConfig;
	scopeContainer: HTMLElement;
	navigatiableNodes: HTMLElement[];

	getNextNodeInfo(key: string): NextNodeInfo;
	init(): void;
	destroy(): void;
	registerOnFocus(handler: DispatchHandler<NodeFocusEvent>): { unregister: () => void };
	refreshNavigatableNodes(): void;
	get currentNode(): HTMLElement | undefined;
}

export interface NavigationKeysConfig {
	prevKeys: string[];
	nextKeys: string[];
}

export type FocusableElement = HTMLElement | SVGElement;

export const NavigationKeysConfigSets = {
	Horizontal: {
		prevKeys: [NavigationKeyConsts.ArrowLeft],
		nextKeys: [NavigationKeyConsts.ArrowRight]
	},
	Vertical: {
		prevKeys: [NavigationKeyConsts.ArrowUp],
		nextKeys: [NavigationKeyConsts.ArrowDown]
	},
	TwoD: {
		prevKeys: [NavigationKeyConsts.ArrowUp, NavigationKeyConsts.ArrowLeft],
		nextKeys: [NavigationKeyConsts.ArrowDown, NavigationKeyConsts.ArrowRight]
	}
};
