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
		scopeId: string;
		scopeOrder?: number;
		children?: Snippet;
		scopeRet?: ScopeInfra;
	}

	let {
		scopeId,
		scopeOrder,
		children,
		class: usrCls,
		scopeRet = $bindable(),

		navigationKeys,
		discoveryMode,
		escapeMode,
		refreshOptions,

		...rest
	}: Props = $props();

	let thisElement: HTMLElement;
	let navigationManager: NavigationManager;

	let errored = $state(false);

	let scopeContext = $state<NavigationScopeContext>({
		scope: undefined
	});

	setNavigationScopeContext(scopeContext);

	onMount(() => {
		if (browser) {
			navigationManager = getNavigationManager();

			if (!navigationManager) {
				console.warn('NavigationScope NavigationManager Not detected');
			}

			console.debug('NavigationScope - NavigaitonManager Context', navigationManager);

			const scopeOptions = {
				navigationKeys,
				discoveryMode,
				escapeMode,
				refreshOptions
			} satisfies NavigationScopeOptions;

			const scope = new NavigationScopeInfraImpl(thisElement, scopeId, scopeOptions);

			try {
				scope.init();
				navigationManager?.registerScope(scope, scopeOrder);

				scopeContext.scope = scope;
				scopeRet = scope;
			} catch (error) {
				errored = true;
				scope.destroy();
				console.error(error);
			}
		}
	});

	onDestroy(() => {
		if (browser && scopeContext.scope) {
			navigationManager?.unregisterScope(scopeContext.scope);
			scopeContext.scope?.destroy();
		}
	});
</script>

<div class={['navigation-scope', usrCls, errored && 'error']} bind:this={thisElement} id={scopeId} {...rest}>
	<div class="outline"></div>
	{@render children?.()}
</div>

<style>
	:global(.keyboard-navigation) .navigation-scope {
		position: relative;

		.outline {
			position: absolute;
			z-index: 500;
			inset: 0;

			pointer-events: none;
		}

		&:focus-within .outline {
			animation: focus-ring-in 500ms ease-out 0ms 1 forwards;
		}
	}

	.navigation-scope {
		&.error {
			background-color: var(--cl-error, red);
		}
	}
</style>
