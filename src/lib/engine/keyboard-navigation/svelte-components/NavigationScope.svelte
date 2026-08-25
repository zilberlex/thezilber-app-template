<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import { browser } from '$app/environment';
	import { type NavigationScopeOptions, type ScopeInfra } from '../types';
	import NavigationScopeInfraImpl from '../navigation-scope';
	import type { NavigationScopeContext } from './types';
	import { getNavigationManager, setNavigationScopeContext } from './navigation-manager-provider.svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement>, NavigationScopeOptions {
		scopeName: string;
		children?: Snippet;
		scopeRet?: ScopeInfra;
	}

	let {
		scopeName,
		children,
		class: usrCls,
		scopeRet = $bindable(),

		navigationKeys,
		discoveryMode,
		escapeMode,
		refresh,

		...rest
	}: Props = $props();

	const id = $props.id();
	const uniqueScopeName = $derived(`${scopeName}-${id}`);

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

		const scopeOptions = {
			navigationKeys,
			discoveryMode,
			escapeMode,
			refresh
		};

		const scope = new NavigationScopeInfraImpl(thisElement, uniqueScopeName, scopeOptions);

		navigationManager?.registerScope(scope);

		scope.init();

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

<div class={['navigation-scope', usrCls]} bind:this={thisElement} id={uniqueScopeName} {...rest}>
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
