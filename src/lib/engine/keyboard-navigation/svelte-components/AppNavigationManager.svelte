<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import type { NavigationKeysConfig } from '../types';
	import { browser } from '$app/environment';
	import { setNavigationManager } from './navigation-manager-provider.svelte';

	interface Props {
		navigationManager?: NavigationManager;
		navigationKeyConfig?: NavigationKeysConfig;
		children?: any;
	}

	let { navigationKeyConfig, navigationManager = $bindable(), children }: Props = $props();

	navigationManager = new NavigationManager(untrack(() => navigationKeyConfig));

	setNavigationManager(navigationManager);

	onMount(() => {
		if (browser) {
			navigationManager.init();

			return () => {
				navigationManager.destroy();
			};
		}
	});
</script>

{@render children()}
