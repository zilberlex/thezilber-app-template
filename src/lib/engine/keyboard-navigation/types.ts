import type { DispatchHandler } from '$lib/engine/patterns/observer';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';

export function createNavigationKeys(nextKeys: string[], prevKeys: string[]): NavigationKeysConfig {
	return {
		prevKeys,
		nextKeys
	};
}

export type NavigationTargetId = string;

export type NavigationDiscoveryMode = 'marked' | 'all-focusable';

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

	getNextNodeInfo(key: string): NextNodeInfo;
	registerOnFocus(handler: DispatchHandler<ScopeFocusEvent>): () => void;
	refreshNavigationTargets(): void;
	get currentNavigationTarget(): ResolvedKeyboardNavigationTarget | undefined;
	get escapeMode(): ScopeEscapeMode;
	focusCurrent(): void;
	focusFirst(): void;
	focusLast(): void;

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
	readonly index: number;
}
