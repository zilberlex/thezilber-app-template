import type { DispatchHandler } from '$lib/engine/patterns/observer';

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
}

export enum NavigationKeyConsts {
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown'
}

export interface NavigationKeysConfig {
	prevKeys: string[];
	nextKeys: string[];
}

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
