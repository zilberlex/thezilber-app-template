import type { DispatchHandler } from '$lib/engine/patterns/observer';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';

export function createNavigationKeys(nextKeys: string[], prevKeys: string[]): NavigationKeysConfig {
	return {
		prevKeys,
		nextKeys
	};
}

export type NavigationTargetId = string;

export type NavigationDiscoveryMode = 'marked' | 'auto';

export interface KeyboardNavigationTarget {
	readonly id: NavigationTargetId;
	readonly targetElement: HTMLElement;
	get navigatableNode(): HTMLElement | undefined;
}

export type ResolvedKeyboardNavigationTarget = Omit<KeyboardNavigationTarget, 'navigatableNode'> & {
	readonly navigatableNode: HTMLElement;
};

export interface ScopeFocusEvent {
	navigationTarget: KeyboardNavigationTarget;
}

export interface NextNodeInfo {
	nextNode?: ResolvedKeyboardNavigationTarget;
	escapeBackupNode?: ResolvedKeyboardNavigationTarget;
}

export interface ScopeInfra {
	scopeId: string;
	navigationKeys: NavigationKeysConfig;
	scopeContainer: HTMLElement;
	navigationTargets: KeyboardNavigationTarget[];

	getNextNodeInfo(key: string): NextNodeInfo;
	init(): void;
	destroy(): void;
	registerOnFocus(handler: DispatchHandler<ScopeFocusEvent>): { unregister: () => void };
	refreshNavigationTargets(): void;
	get currentNavigationTarget(): ResolvedKeyboardNavigationTarget | undefined;
	get escapeMode(): ScopeEscapeMode;
	focusCurrent(): void;
	focusFirst(): void;
	focusLast(): void;
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
