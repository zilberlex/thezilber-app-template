<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import type { NavigationKeysConfig } from '../types';
	import { signalNavigationHotkeyEvent } from '$lib/engine/hotkeys/bl-hotkeys-event-signals';
	import { browser } from '$app/environment';
	import { setNavigationManager } from './navigation-manager-provider';

	interface Props {
		navigationKeyConfig?: NavigationKeysConfig;
		children?: any;
	}

	let { navigationKeyConfig, children }: Props = $props();

	let navigationManager: NavigationManager = new NavigationManager(untrack(() => navigationKeyConfig));

	setNavigationManager(navigationManager);

	onMount(() => {
		if (browser) {
			navigationManager.init();

			navigationManager.registerNavigationHandler((obj) => {
				signalNavigationHotkeyEvent(obj.initiatingKey, obj.targetNode);
			});

			return () => {
				navigationManager.destroy();
			};
		}
	});
</script>

{@render children()}
