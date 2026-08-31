<script lang="ts">
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import AppNavigationManager from '$lib/engine/keyboard-navigation/svelte-components/AppNavigationManager.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { NavigationManager } from '$lib/engine/keyboard-navigation/navigation-manager';
	import NavigationManagerDebugScreen from '$lib/app/debug-screens/NavigationManagerDebugScreen.svelte';
	import { debugState } from '$lib/engine/state/debug-state.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/configurations';
	import ToggleOnOff from '../ToggleOnOff.svelte';
	import { markForNavigation } from '$lib/engine/keyboard-navigation/svelte-components/attachments';

	let showScopeA = $state(true);
	let showScopeB = $state(true);
	let showScopeC = $state(false);

	let hideC2 = $state(false);

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

				<ToggleOnOff bind:toggle={hideC2} {@attach createClickHotKeyAttachment('Toggle Element C-2', hotkey('4'))}>
					Toggle C-2 + Add Random
				</ToggleOnOff>
			</NavigationScope>

			<div class="scopes">
				<div class="scope-container">
					<NavigationScope scopeId="scopeA" class="scope" escapeMode="escape" discoveryMode="all-focusable">
						<div>Scope A - Discovery All-Focusable</div>
						{#if showScopeA}
							<Button }>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						{/if}
					</NavigationScope>
				</div>

				<div class="scope-container">
					<NavigationScope scopeId="scopeB" class="scope" escapeMode="escape" discoveryMode="marked">
						<div>Scope B - Discovery Marked, Auto Id</div>
						{#if showScopeB}
							<Button {@attach markForNavigation()}>A</Button>
							<Button {@attach markForNavigation()}>B</Button>
							<Button {@attach markForNavigation()}>C</Button>
						{/if}
					</NavigationScope>
				</div>

				<div class="scope-container">
					<NavigationScope scopeId="scopeC" class="scope" escapeMode="escape" discoveryMode={'marked'}>
						<div>Scope C - Discovery Marked, Explicit Id</div>
						{#if showScopeC}
							<Button {@attach markForNavigation('3-a')}>A</Button>
							{#if !hideC2}
								<Button {@attach markForNavigation('3-b')}>B</Button>
							{:else}
								<Button {@attach markForNavigation('C-1-rand')}>Random-1</Button>
								<Button {@attach markForNavigation('C-2-rand')}>Random-2</Button>
								<Button {@attach markForNavigation('C-3-rand')}>Random-3</Button>
							{/if}
							<Button {@attach markForNavigation('3-c')}>C</Button>
						{/if}
					</NavigationScope>
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

	:global(.scope) {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);

		width: 100%;
	}
</style>
