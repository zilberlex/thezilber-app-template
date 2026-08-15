import type { DispatchHandler } from '$lib/engine/patterns/observer';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';

export function createNavigationKeys(nextKeys: string[], prevKeys: string[]): NavigationKeysConfig {
	return {
		prevKeys,
		nextKeys
	};
}

export interface NavigationTarget {
	readonly targetElement: HTMLElement;
	readonly navigatableNode: HTMLElement | undefined;
}

export interface NodeFocusEvent {
	targetNode: HTMLElement;
}

export interface NextNodeInfo {
	nextNode?: NavigationTarget;
	escapeBackupNode?: NavigationTarget;
}

export interface ScopeInfra {
	scopeName: string;
	navigationKeys: NavigationKeysConfig;
	scopeContainer: HTMLElement;
	navigationTargets: NavigationTarget[];

	getNextNodeInfo(key: string): NextNodeInfo;
	init(): void;
	destroy(): void;
	registerOnFocus(handler: DispatchHandler<NodeFocusEvent>): { unregister: () => void };
	refreshNavigatableNodes(): void;
	get currentNavigationTarget(): NavigationTarget | undefined;
	get escapeMode(): ScopeEscapeMode;
	observeMutations(element: HTMLElement, options: MutationObserverInit): void;
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

export type ScopeEscapeMode = 'escape' | 'circular';
