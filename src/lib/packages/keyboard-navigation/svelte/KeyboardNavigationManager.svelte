<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import type { NavigationKeysConfig } from '../types';
	import { browser } from '$app/environment';
	import { setNavigationManager } from './navigation-manager-provider.svelte.js';
	import { type ElementInteraction, nativeElementInteraction } from '$lib/packages/interactions';

	interface Props {
		navigationManager?: NavigationManager;
		navigationKeyConfig?: NavigationKeysConfig;
		elementInteraction?: ElementInteraction;
		children?: any;
	}

	let {
		navigationKeyConfig,
		navigationManager = $bindable(),
		elementInteraction = nativeElementInteraction,
		children
	}: Props = $props();

	navigationManager = new NavigationManager(
		untrack(() => navigationKeyConfig),
		untrack(() => elementInteraction)
	);

	setNavigationManager(navigationManager);

	if (browser) {
		navigationManager.init();
	}

	onDestroy(() => {
		if (browser) {
			navigationManager.destroy();
		}
	});
</script>

{@render children()}
