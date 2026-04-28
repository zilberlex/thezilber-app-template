<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import { browser } from '$app/environment';
	import { type NavigationKeysConfig, type ScopeInfra, NavigationKeysConfigSets } from '../types';
	import NavigationScopeInfraImpl from '../navigation-scope';
	import { mergeProps } from 'svelte-toolbelt';

	interface Props {
		navigationKeys?: NavigationKeysConfig;
		scopeName: string;
		children?: any;
		class?: any;
	}

	let { navigationKeys, scopeName, children, class: usrCls }: Props = $props();

	let thisElement: HTMLElement;

	let scope: ScopeInfra;

	let navigationManager: NavigationManager;
	let mutationObserver: MutationObserver;

	navigationManager = getContext('navigationManager');

	const scopeClass = 'navigation-scope';

	let mergedClasses = mergeProps({ class: scopeClass }, { class: usrCls });

	onMount(() => {
		if (!navigationManager) {
			console.warn('NavigationScope NavigationManager Not detected');
		}

		if (browser) {
			console.debug('NavigationScope - NavigaitonManager Context', navigationManager);

			navigationKeys = navigationKeys ?? NavigationKeysConfigSets.Horizontal;
			scope = new NavigationScopeInfraImpl(thisElement, navigationKeys, scopeName);

			const refreshChildren = () => scope.refreshNavigatableNodes();

			navigationManager?.registerScope(scope);
			mutationObserver = new MutationObserver(refreshChildren);
			mutationObserver.observe(thisElement, {
				childList: true,
				subtree: true
			});

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

<div {...mergedClasses} bind:this={thisElement}>
	<div class="outline"></div>
	{@render children?.()}
</div>

<style>
	:global(.keyboard-navigation) .navigation-scope {
		position: relative;

		.outline {
			position: absolute;
			z-index: 500;
			inset: 2px;

			pointer-events: none;
		}

		&:focus-within .outline {
			animation: focus-ring-in 500ms ease-out 0ms 1 forwards;
		}
	}
</style>
