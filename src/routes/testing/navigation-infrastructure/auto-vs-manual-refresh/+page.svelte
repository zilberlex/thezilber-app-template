<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';
	import NavigatableAndUnnavigatableSwitcher from '../NavigatableAndUnnavigatableSwitcher.svelte';
	import { browser } from '$app/environment';
	import { kbKey } from '@svelte-ascend/core';
	import type { ScopeInfra } from '@svelte-ascend/keyboard-navigation';
	import { assignNavigationManagerKeys, KeyboardNavigationScope } from '@svelte-ascend/keyboard-navigation/svelte';

	let scopeManual = $state<ScopeInfra>();

	onMount(() => {
		if (browser) {
			return assignNavigationManagerKeys(kbKey('t'), kbKey('t', 'shift'));
		}
	});
</script>

<main class="ly-center">
	<div class="cases">
		<div class="case">
			<h3>Auto</h3>
			<KeyboardNavigationScope scopeId="scope-1" refreshOptions={{ mode: 'automatic' }}>
				<div class="list">
					<NavigatableAndUnnavigatableSwitcher startingState="button">A</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher startingState="button">B</NavigatableAndUnnavigatableSwitcher>
				</div>
			</KeyboardNavigationScope>
		</div>
		<div class="case">
			<h3>Manual</h3>
			<KeyboardNavigationScope scopeId="scope-2" refreshOptions={{ mode: 'manual' }} bind:scopeRet={scopeManual}>
				<div class="list">
					<NavigatableAndUnnavigatableSwitcher startingState="button">A</NavigatableAndUnnavigatableSwitcher>
					<NavigatableAndUnnavigatableSwitcher startingState="div">B</NavigatableAndUnnavigatableSwitcher>
				</div>
				<Button onclick={() => scopeManual?.refreshNavigationTargets()}>Refresh</Button>
			</KeyboardNavigationScope>
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
