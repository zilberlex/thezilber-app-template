<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import { browser } from '$app/environment';
	import { type NavigationKeysConfig, type ScopeInfra, NavigationKeysConfigSets } from '../types';
	import NavigationScopeInfraImpl from '../navigation-scope';

	interface Props {
		navigationKeys?: NavigationKeysConfig;
		scopeName: string;
		children?: any;
	}

	let { navigationKeys, scopeName, children }: Props = $props();

	let thisElement: HTMLElement;

	let scope: ScopeInfra;

	let navigationManager: NavigationManager;

	navigationManager = getContext('navigationManager');

	onMount(() => {
		if (!navigationManager) {
			console.warn('NavigationScope NavigationManager Not detected');
		}

		if (browser) {
			console.debug('NavigationScope - NavigaitonManager Context', navigationManager);

			navigationKeys = navigationKeys ?? NavigationKeysConfigSets.Horizontal;
			scope = new NavigationScopeInfraImpl(
				thisElement,
				navigationKeys,
				scopeName
			);

			navigationManager?.registerScope(scope);

			scope.init();
		}
	});

	onDestroy(() => {
		if (browser) {
			navigationManager?.unregisterScope(scope);
			scope.destroy();
		}
	});
</script>

<span class="arrow-navigation-scope_uid" bind:this={thisElement}>
	{@render children?.()}
</span>
