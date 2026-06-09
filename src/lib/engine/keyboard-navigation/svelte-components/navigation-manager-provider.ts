import { getContext, setContext } from 'svelte';
import { NAVIGATION_MANAGER_CONTEXT } from './consts';
import type { NavigationManager } from '../navigation-manager';

export function getNavigationManager(): NavigationManager {
	return getContext(NAVIGATION_MANAGER_CONTEXT);
}
export function setNavigationManager(navigationManage: NavigationManager) {
	return setContext(NAVIGATION_MANAGER_CONTEXT, navigationManage);
}
