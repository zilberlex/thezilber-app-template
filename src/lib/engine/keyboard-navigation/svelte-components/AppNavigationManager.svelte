<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import type { NavigationKeysConfig } from '../types';
	import { browser } from '$app/environment';
	import { setNavigationManager } from './navigation-manager-provider.svelte';

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

			return () => {
				navigationManager.destroy();
			};
		}
	});
</script>

{@render children()}
