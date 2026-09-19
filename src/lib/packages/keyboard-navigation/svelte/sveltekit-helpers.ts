import type { HotKey } from '../../../../../packages/hotkey-module/src/lib';
import { getNavigationManager } from './navigation-manager-provider.svelte.js';

export function assignNavigationManagerKeys(nextKey: HotKey, prevKey: HotKey) {
	const navigationManager = getNavigationManager();

	if (!navigationManager) {
		console.error('Navigation Manager Not assigned');
		return;
	}

	return navigationManager.assignScopeNavigationKeys([nextKey], [prevKey]);
}
