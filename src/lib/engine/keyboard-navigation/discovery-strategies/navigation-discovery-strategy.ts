import type { NavigationDiscoveryMode } from '../types';
import { allFocusableDiscoveryStrategy } from './all-focusable-strategy';
import { markedDiscoveryStrategy } from './marked-strategy';

export interface NavigationDiscoveryStrategy {
	readonly mode: NavigationDiscoveryMode;
	readonly observerOptions: MutationObserverInit;

	discover(rootElement: HTMLElement): HTMLElement[];
	isInvalidatedBy(mutations: readonly MutationRecord[]): boolean;
}

export function getNavigationDiscoveryStrategy(mode: NavigationDiscoveryMode): NavigationDiscoveryStrategy {
	return discoveryStrategies[mode];
}

const discoveryStrategies = {
	marked: markedDiscoveryStrategy,
	'all-focusable': allFocusableDiscoveryStrategy
} satisfies Record<NavigationDiscoveryMode, NavigationDiscoveryStrategy>;
