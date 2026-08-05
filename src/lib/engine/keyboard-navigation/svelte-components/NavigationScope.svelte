<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import { browser } from '$app/environment';
	import { type NavigationKeysConfig, type ScopeEscapeMode, type ScopeInfra, NavigationKeysConfigSets } from '../types';
	import NavigationScopeInfraImpl from '../navigation-scope';
	import { NAVIGATION_MANAGER_CONTEXT } from './consts';

	interface Props {
		navigationKeys?: NavigationKeysConfig;
		scopeName: string;
		children?: any;
		class?: any;
		escapeMode?: ScopeEscapeMode;
	}

	let {
		navigationKeys = NavigationKeysConfigSets.Vertical,
		scopeName,
		children,
		class: usrCls,
		escapeMode = 'circular'
	}: Props = $props();

	let thisElement: HTMLElement;

	let scope: ScopeInfra;

	let navigationManager: NavigationManager;
	let mutationObserver: MutationObserver;

	navigationManager = getContext(NAVIGATION_MANAGER_CONTEXT);

	onMount(() => {
		if (!navigationManager) {
			console.warn('NavigationScope NavigationManager Not detected');
		}

		if (browser) {
			console.debug('NavigationScope - NavigaitonManager Context', navigationManager);

			navigationKeys = navigationKeys;
			scope = new NavigationScopeInfraImpl(thisElement, navigationKeys, scopeName, escapeMode);

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

<div class={['navigation-scope', usrCls]} bind:this={thisElement}>
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
