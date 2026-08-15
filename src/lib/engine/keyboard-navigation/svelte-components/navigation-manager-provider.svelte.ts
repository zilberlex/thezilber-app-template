import { createContext, getContext, setContext } from 'svelte';
import { NAVIGATION_MANAGER_CONTEXT, NAVIGATION_SCOPE_CONTEXT } from './consts';
import type { NavigationManager } from '../navigation-manager';
import type { NavigationScopeContext } from './types';

export function getNavigationManager(): NavigationManager {
	return getContext<NavigationManager>(NAVIGATION_MANAGER_CONTEXT);
}
export function setNavigationManager(navigationManager: NavigationManager) {
	return setContext(NAVIGATION_MANAGER_CONTEXT, navigationManager);
}

export const [getNavigationScopeContext, setNavigationScopeContext] = createContext<NavigationScopeContext>();
