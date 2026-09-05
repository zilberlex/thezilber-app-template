import type { HotKey } from '$lib/engine/hotkeys/hotkey-class';
import { getNavigationManager } from './navigation-manager-provider.svelte';

export function assignNavigationManagerKeys(nextKey: HotKey, prevKey: HotKey) {
	const navigationManager = getNavigationManager();

	if (!navigationManager) {
		console.error('Navigation Manager Not assigned');
		return;
	}

	return navigationManager.assignScopeNavigationKeys([nextKey], [prevKey]);
}
