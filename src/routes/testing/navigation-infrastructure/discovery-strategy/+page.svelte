<script lang="ts">
	import { markForNavigation } from '$lib/engine/keyboard-navigation/attachments';
	import { getNavigationManager } from '$lib/engine/keyboard-navigation/svelte-components/navigation-manager-provider.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import NavigatableAndUnnavigatableSwitcher from '../NavigatableAndUnnavigatableSwitcher.svelte';
	import type { ScopeInfra } from '$lib/engine/keyboard-navigation/types';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let navigationManager = getNavigationManager();
	onMount(() => {
		if (browser) {
			return navigationManager.assignScopeNavigationKeys([hotkey('t')], [hotkey('t', 'shift')]);
		}
	});

	let scopeAllFocusable = $state<ScopeInfra>();
	let scopeMarkedStable = $state<ScopeInfra>();
	let scopeMarkedNonStable = $state<ScopeInfra>();

	let refreshAllFocusableCount = $state(0);
	let refreshMarkedCount = $state(0);
	let refreshMarkedNonStableCount = $state(0);

	let nonStableElements = $state([0, 1, 2]);
</script>

<main class="ly-center">
	<div>
		<div class="container">
			<NavigationScope scopeName="scope-all-focusable" discoveryMode="all-focusable" bind:scopeRet={scopeAllFocusable}>
				<div class="list">
					<div>
						All-Focusable Discovery - Refresh Count <span class="emp">[{refreshAllFocusableCount}]</span>
					</div>
					<NavigatableAndUnnavigatableSwitcher>A</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher>B</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher>C</NavigatableAndUnnavigatableSwitcher>
				</div>
			</NavigationScope>
			<NavigationScope scopeName="scope-marked-stable" discoveryMode="marked" bind:scopeRet={scopeMarkedStable}>
				<div class="list">
					<div>
						Marked Discovery (Marked Element is Not Touched)- Refresh Count <span class="emp"
							>[{refreshMarkedCount}]</span
						>
					</div>
					<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>A</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>B</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>C</NavigatableAndUnnavigatableSwitcher>
				</div>
			</NavigationScope>
			<NavigationScope scopeName="scope-marked-unstable" discoveryMode="marked" bind:scopeRet={scopeMarkedNonStable}>
				<div class="list">
					<div>
						Marked Discovery (NonStable)- Refresh Count <span class="emp">[{refreshMarkedNonStableCount}]</span>
					</div>
					{#each nonStableElements as el}
						<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>{el}</NavigatableAndUnnavigatableSwitcher>
					{/each}
					<Button onclick={() => nonStableElements.push((nonStableElements.findLast(() => true) ?? 0) + 1)}>
						Add Element
					</Button>
					<Button onclick={() => nonStableElements.pop()}>Remove Element</Button>
				</div>
			</NavigationScope>
		</div>
		<div class="controls">
			<Button
				onclick={() => {
					refreshAllFocusableCount = scopeAllFocusable?._debugInfo().refreshCount ?? 0;
					refreshMarkedCount = scopeMarkedStable?._debugInfo().refreshCount ?? 0;
					refreshMarkedNonStableCount = scopeMarkedNonStable?._debugInfo().refreshCount ?? 0;
				}}
				{@attach createClickHotKeyAttachment('Refresh Counts', false, hotkey('r', 'alt'))}
				>Refresh Number Counter</Button
			>
		</div>
	</div>
</main>

<style>
	.container {
		display: flex;
		flex-direction: row;
		gap: var(--space-6);
	}

	.list {
		display: flex;
		gap: var(--space-4);
		flex-direction: column;
	}

	.controls {
		margin-top: var(--space-8);
	}

	.emp {
		display: inline;
		color: var(--cl-primary);
	}
</style>
