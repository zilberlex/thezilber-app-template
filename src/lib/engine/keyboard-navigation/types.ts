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

export const ArrowKeysArray: string[] = [
	NavigationKeyConsts.ArrowDown,
	NavigationKeyConsts.ArrowUp,
	NavigationKeyConsts.ArrowLeft,
	NavigationKeyConsts.ArrowRight
];

export const NodesWhichDontNavigateWithArrowKeys = ['input', 'select', 'summary'];

export type NavType = {
	direction: 'hor-prev' | 'hor-next' | 'ver-prev' | 'ver-next' | undefined;
	strength: 'soft' | 'hard';
	isArrow: boolean;
};

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
