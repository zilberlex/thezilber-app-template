<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import NavigationManagerDebugScreen from '$lib/app/debug-screens/NavigationManagerDebugScreen.svelte';
	import { debugState } from '$lib/engine/state/debug-state.svelte';
	import ToggleOnOff from '../ToggleOnOff.svelte';
	import { createHotKeyTriggerClickAttachment } from '$lib/engine/engine-hotkeys/hotkey-actions';
	import { kbKey } from '@svelte-ascend/core';

	import { NavigationKeysConfigSets, NavigationManager } from '@svelte-ascend/keyboard-navigation';
	import { KeyboardNavigationManager, KeyboardNavigationScope } from '@svelte-ascend/keyboard-navigation/svelte';

	let showScopeA = $state(true);
	let showScopeB = $state(true);
	let showScopeC = $state(false);

	let navigationManager = $state<NavigationManager>();

	debugState.customizableDebugScreen = customDebugSnippet;
</script>

{#snippet customDebugSnippet()}
	<NavigationManagerDebugScreen {navigationManager} />
{/snippet}

<KeyboardNavigationManager bind:navigationManager>
	<main class="ly-center">
		<div class="container">
			<KeyboardNavigationScope scopeId="controlsScope" navigationKeys={NavigationKeysConfigSets.Horizontal}>
				<ToggleOnOff bind:toggle={showScopeA} {@attach createHotKeyTriggerClickAttachment('Toggle A', kbKey('1'))}>
					Scope A
				</ToggleOnOff>
				<ToggleOnOff bind:toggle={showScopeB} {@attach createHotKeyTriggerClickAttachment('Toggle B', kbKey('2'))}>
					Scope B
				</ToggleOnOff>
				<ToggleOnOff bind:toggle={showScopeC} {@attach createHotKeyTriggerClickAttachment('Toggle C', kbKey('3'))}>
					Scope C
				</ToggleOnOff>
			</KeyboardNavigationScope>

			<div class="scopes">
				<div class="scope-container" class:hidden={!showScopeA}>
					{#if showScopeA}
						<div>Scope A</div>
						<KeyboardNavigationScope scopeId="scopeA" class="scope" escapeMode="escape">
							<Button>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						</KeyboardNavigationScope>
					{/if}
				</div>

				<div class="scope-container" class:hidden={!showScopeB}>
					{#if showScopeB}
						<div>Scope B</div>
						<KeyboardNavigationScope scopeId="scopeB" class="scope" escapeMode="escape">
							<Button>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						</KeyboardNavigationScope>
					{/if}
				</div>

				<div class="scope-container" class:hidden={!showScopeC}>
					{#if showScopeC}
						<div>Scope C</div>
						<KeyboardNavigationScope scopeId="scopeC" class="scope" escapeMode="escape">
							<Button>A</Button>
							<Button>B</Button>
							<Button>C</Button>
						</KeyboardNavigationScope>
					{/if}
				</div>
			</div>
		</div>
	</main>
</KeyboardNavigationManager>

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
