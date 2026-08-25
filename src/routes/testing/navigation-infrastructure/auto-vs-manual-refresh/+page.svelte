<script lang="ts">
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import type { ScopeInfra } from '$lib/engine/keyboard-navigation/types';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';
	import NavigatableAndUnnavigatableSwitcher from '../NavigatableAndUnnavigatableSwitcher.svelte';
	import { browser } from '$app/environment';
	import { assignNavigationManagerKeys } from '$lib/engine/keyboard-navigation/svelte-components/sveltekit-helpers';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';

	let scopeManual = $state<ScopeInfra>();

	onMount(() => {
		if (browser) {
			return assignNavigationManagerKeys(hotkey('t'), hotkey('t', 'shift'));
		}
	});
</script>

<main class="ly-center">
	<div class="cases">
		<div class="case">
			<h3>Auto</h3>
			<NavigationScope scopeName="scope-auto" refresh={{ mode: 'automatic' }}>
				<div class="list">
					<NavigatableAndUnnavigatableSwitcher startingState="button">A</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher startingState="button">B</NavigatableAndUnnavigatableSwitcher>
				</div>
			</NavigationScope>
		</div>
		<div class="case">
			<h3>Manual</h3>
			<NavigationScope scopeName="scope-auto" refresh={{ mode: 'manual' }} bind:scopeRet={scopeManual}>
				<div class="list">
					<NavigatableAndUnnavigatableSwitcher startingState="button">A</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher startingState="div">B</NavigatableAndUnnavigatableSwitcher>
				</div>
				<Button onclick={() => scopeManual?.refreshNavigationTargets()}>Refresh</Button>
			</NavigationScope>
		</div>
	</div>
</main>

<style>
	.cases {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	h3 {
		margin-bottom: var(--space-2);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
</style>
