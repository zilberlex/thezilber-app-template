import type { DispatchHandler } from '@svelte-ascend/core';
import type { ElementInteraction } from '@svelte-ascend/interactions';

export type NavType = {
	direction: 'hor-prev' | 'hor-next' | 'ver-prev' | 'ver-next' | undefined;
	isArrow: boolean;
};

export function createNavigationKeys(nextKeys: string[], prevKeys: string[]): NavigationKeysConfig {
	return {
		prevKeys,
		nextKeys
	};
}

export type NavigationDiscoveryMode = 'marked' | 'all-focusable';

export type NavigationTargetId = string;

export interface KeyboardNavigationTarget {
	readonly id: NavigationTargetId;
	get targetElement(): HTMLElement | undefined;
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

	elementInteraction: ElementInteraction;

	getNextNodeInfo(key: string): NextNodeInfo;
	registerOnFocus(handler: DispatchHandler<ScopeFocusEvent>): () => void;
	refreshNavigationTargets(): void;
	get currentNavigationTarget(): ResolvedKeyboardNavigationTarget | undefined;
	get escapeMode(): ScopeEscapeMode;
	focusCurrent(): void;
	focusFirst(): void;
	focusLast(): void;
	hasFocus(): boolean;

	getNavigationTargetRestorationPoint(): NavigationTargetRestorationPoint | undefined;
	restoreNavigationTarget(restorationPoint: NavigationTargetRestorationPoint): boolean;

	hasNavigationTargetForNode(node: Element | null): boolean;

	init(): void;
	destroy(): void;

	_debugInfo(): { refreshCount: number };
}

export interface NavigationKeysConfig {
	prevKeys: string[];
	nextKeys: string[];
}

export type FocusableElement = HTMLElement | SVGElement;

export type ScopeEscapeMode = 'escape' | 'circular';

export interface NavigationScopeOptions {
	navigationKeys?: NavigationKeysConfig;
	discoveryMode?: NavigationDiscoveryMode;
	escapeMode?: ScopeEscapeMode;

	refreshOptions?: NavigationRefreshConfig;
}

export interface NavigationRefreshConfig {
	mode: 'automatic' | 'manual';
}

export interface NavigationTargetRestorationPoint {
	readonly id: NavigationTargetId;
	readonly index: number;
}
