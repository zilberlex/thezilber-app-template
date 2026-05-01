<script lang="ts">
	import { onDestroy, setContext } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import type { NavigationKeysConfig } from '../types';
	import { signalNavigationHotkeyEvent } from '$lib/engine/hotkeys/bl-hotkeys-event-signals';
	import { browser } from '$app/environment';
	import { NAVIGATION_MANAGER_CONTEXT } from './consts';

	interface Props {
		navigationKeyConfig?: NavigationKeysConfig;
		children?: any;
	}

	let { navigationKeyConfig, children }: Props = $props();

	let navigationManager: NavigationManager = new NavigationManager(navigationKeyConfig);

	setContext(NAVIGATION_MANAGER_CONTEXT, navigationManager);

	onDestroy(() => {
		navigationManager.destroy();
	});

	$effect(() => {
		if (browser) {
			navigationManager.init();

			const navManagerNavigationHotkeyHandlerDestroy = navigationManager.registerNavigationHandler(
				(obj) => {
					signalNavigationHotkeyEvent(obj.initiatingKey, obj.targetNode);
				}
			);

			return () => {
				navManagerNavigationHotkeyHandlerDestroy();
			};
		}
	});
</script>

{@render children()}
