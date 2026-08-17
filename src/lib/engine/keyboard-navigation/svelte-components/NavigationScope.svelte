<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import { browser } from '$app/environment';
	import {
		type NavigationDiscoveryMode,
		type NavigationKeysConfig,
		type ScopeEscapeMode,
		type ScopeInfra,
		NavigationKeysConfigSets
	} from '../types';
	import NavigationScopeInfraImpl from '../navigation-scope';
	import type { NavigationScopeContext } from './types';
	import { getNavigationManager, setNavigationScopeContext } from './navigation-manager-provider.svelte';

	interface Props {
		navigationKeys?: NavigationKeysConfig;
		scopeName: string;
		children?: any;
		class?: any;
		escapeMode?: ScopeEscapeMode;
		observerParams?: MutationObserverInit & { shouldObserveThisElement: boolean };
		discoveryMode?: NavigationDiscoveryMode;
		scopeRet?: ScopeInfra;
	}

	const defaultObserverParams = {
		childList: true,
		subtree: true,
		shouldObserveThisElement: true
	};

	let {
		navigationKeys = NavigationKeysConfigSets.Vertical,
		scopeName,
		children,
		class: usrCls,
		discoveryMode = 'auto',
		escapeMode = 'circular',
		observerParams = {
			childList: true,
			subtree: true,
			shouldObserveThisElement: true
		},
		scopeRet = $bindable()
	}: Props = $props();

	const id = $props.id();
	const uniqueScopeName = $derived(`${scopeName}-${id}`);

	let resolvedObserverParams = $derived({
		...defaultObserverParams,
		...observerParams
	});

	let thisElement: HTMLElement;
	let navigationManager: NavigationManager;

	let scopeContext = $state<NavigationScopeContext>({
		scope: undefined
	});

	setNavigationScopeContext(scopeContext);

	onMount(() => {
		navigationManager = getNavigationManager();

		if (!navigationManager) {
			console.warn('NavigationScope NavigationManager Not detected');
		}

		console.debug('NavigationScope - NavigaitonManager Context', navigationManager);

		navigationKeys = navigationKeys;
		const scope = new NavigationScopeInfraImpl(thisElement, navigationKeys, uniqueScopeName, discoveryMode, escapeMode);

		navigationManager?.registerScope(scope);

		scope.init();

		if (resolvedObserverParams.shouldObserveThisElement) {
			scope.observeMutations(thisElement, resolvedObserverParams);
		}

		scopeContext.scope = scope;
		scopeRet = scope;
	});

	onDestroy(() => {
		if (browser && scopeContext.scope) {
			navigationManager?.unregisterScope(scopeContext.scope);
			scopeContext.scope?.destroy();
		}
	});
</script>

<div class={['navigation-scope', usrCls]} bind:this={thisElement} id={uniqueScopeName}>
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
