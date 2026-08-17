<script lang="ts">
	import { browser } from '$app/environment';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { getNavigationManager } from '$lib/engine/keyboard-navigation/svelte-components/navigation-manager-provider.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import type { ScopeInfra } from '$lib/engine/keyboard-navigation/types';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';

	let newButtonCounter = 1;
	let buttonsInfo1 = $state([
		{ id: 'button-1', label: 'Button1' },
		{ id: 'button-2', label: 'Button2' },
		{ id: 'button-3', label: 'Button3' }
	]);

	let navigationManager = getNavigationManager();
	onMount(() => {
		if (browser) {
			navigationManager.assignScopeNavigationKeys([hotkey('t')], [hotkey('t', 'shift')]);
		}
	});

	let scope1 = $state<ScopeInfra>();
</script>

<div class="demo-container ly-center">
	<NavigationScope scopeName="nav-scope-1" bind:scopeRet={scope1}>
		<div class="list list-1 content-surface">
			<h3>Scope 1:</h3>
			{#each buttonsInfo1 as btn (btn.id)}
				<Button>
					{btn.label}
				</Button>
			{/each}
		</div>
	</NavigationScope>
	<NavigationScope scopeName="nav-scope-2">
		<div class="list list-2 content-surface">
			<h3>Scope 2:</h3>
			{#each buttonsInfo1 as btn (btn.id)}
				<Button>
					{btn.label}
				</Button>
			{/each}
		</div>
	</NavigationScope>
	<div class="controls">
		<h3>Controls:</h3>
		<NavigationScope scopeName="nav-scope-controles">
			<Button
				onclick={() => {
					console.debug('Refeshing Nodes Scope 1', { scopeName: scope1?.scopeName });
					scope1?.refreshNavigatableNodes();
				}}
			>
				Refresh Scope 1
			</Button>
			<Button
				onclick={() => {
					buttonsInfo1.splice(2, 0, {
						id: `button-new-${newButtonCounter++}`,
						label: `New Button ${newButtonCounter}`
					});
				}}
			>
				Add Element
			</Button>
		</NavigationScope>
	</div>
</div>

<style>
	.demo-container {
		gap: var(--space-4);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
