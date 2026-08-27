<script lang="ts">
	import { browser } from '$app/environment';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import AppNavigationManager from '$lib/engine/keyboard-navigation/svelte-components/AppNavigationManager.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { assignNavigationManagerKeys } from '$lib/engine/keyboard-navigation/svelte-components/sveltekit-helpers';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';
	import ToggleOnOff from './ToggleOnOff.svelte';
	import { NavigationManager } from '$lib/engine/keyboard-navigation/navigation-manager';
	import NavigationManagerDebugScreen from '$lib/app/debug-screens/NavigationManagerDebugScreen.svelte';
	import { debugState } from '$lib/engine/state/debug-state.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/configurations';

	let showScopeA = $state(true);
	let showScopeB = $state(true);
	let showScopeC = $state(false);

	let navigationManager = $state<NavigationManager>();

	$effect(() => {
		if (navigationManager) {
			navigationManager.assignScopeNavigationKeys([hotkey('t')], [hotkey('t', 'shift')]);
		}
	});

	debugState.customizableDebugScreen = customDebugSnippet;
</script>

{#snippet customDebugSnippet()}
	<NavigationManagerDebugScreen {navigationManager} />
{/snippet}

<AppNavigationManager bind:navigationManager>
	<main class="ly-center">
		<div class="container">
			<NavigationScope scopeId="controlsScope" navigationKeys={NavigationKeysConfigSets.Horizontal}>
				<ToggleOnOff bind:toggle={showScopeA} {@attach createClickHotKeyAttachment('Toggle A', hotkey('1'))}>
					Scope A
				</ToggleOnOff>
				<ToggleOnOff bind:toggle={showScopeB} {@attach createClickHotKeyAttachment('Toggle B', hotkey('2'))}>
					Scope B
				</ToggleOnOff>
				<ToggleOnOff bind:toggle={showScopeC} {@attach createClickHotKeyAttachment('Toggle C', hotkey('3'))}>
					Scope C
				</ToggleOnOff>
			</NavigationScope>

			<div class="scopes">
				<div class="scope-container" class:hidden={!showScopeA}>
					{#if showScopeA}
						<div>Scope A</div>
						<NavigationScope scopeId="scopeA" class="scope" escapeMode="escape">
							<Button>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						</NavigationScope>
					{/if}
				</div>

				<div class="scope-container" class:hidden={!showScopeB}>
					{#if showScopeB}
						<div>Scope B</div>
						<NavigationScope scopeId="scopeB" class="scope" escapeMode="escape">
							<Button>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						</NavigationScope>
					{/if}
				</div>

				<div class="scope-container" class:hidden={!showScopeC}>
					{#if showScopeC}
						<div>Scope C</div>
						<NavigationScope scopeId="scopeC" class="scope" escapeMode="escape">
							<Button>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						</NavigationScope>
					{/if}
				</div>
			</div>
		</div>
	</main>
</AppNavigationManager>

<style>
	.scopes {
		display: flex;
		gap: var(--space-8);
		width: 100%;
	}

	.scope-container {
		margin-top: var(--space-4);
		display: flex;
		flex-direction: column;

		flex: 1 1 0;
		min-width: 0;
		min-height: 300px;

		transition:
			flex-grow 300ms ease,
			opacity 200ms ease;
	}

	.scope-container.hidden {
		flex-grow: 0;
		flex-basis: 0;
		opacity: 0;
		overflow: hidden;
	}

	:global(.scope) {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);

		width: 100%;
	}
</style>
