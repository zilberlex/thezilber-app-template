<script lang="ts">
	import { browser } from '$app/environment';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { getNavigationManager } from '$lib/engine/keyboard-navigation/svelte-components/navigation-manager-provider.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import type { ScopeInfra } from '$lib/engine/keyboard-navigation/types';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';
	import { markForNavigation } from '$lib/engine/keyboard-navigation/attachments';
	import ButtonInputSwitch from '../ButtonInputSwitch.svelte';

	let newButtonCounter = 1;
	let buttonsInfo1 = $state([
		{ id: 'button-1', label: 'Button1' },
		{ id: 'button-2', label: 'Button2' },
		{ id: 'button-3', label: 'Button3' }
	]);

	let navigationManager = getNavigationManager();
	onMount(() => {
		if (browser) {
			return navigationManager.assignScopeNavigationKeys([hotkey('t')], [hotkey('t', 'shift')]);
		}
	});

	let scope1 = $state<ScopeInfra>();
</script>

<div class="demo-container ly-center">
	<NavigationScope scopeName="nav-scope-1" bind:scopeRet={scope1} discoveryMode="marked">
		<div class="list list-1 content-surface">
			<h3>Scope Direct Mark Elements:</h3>
			{#each buttonsInfo1 as btn (btn.id)}
				<ButtonInputSwitch content={btn.label} {@attach markForNavigation} />
			{/each}
		</div>
	</NavigationScope>
	<NavigationScope scopeName="nav-scope-2" discoveryMode="marked">
		<div class="list list-2 content-surface">
			<h3>Scope Mark Container:</h3>
			{#each buttonsInfo1 as btn (btn.id)}
				<div class="element-container" {@attach markForNavigation}>
					<ButtonInputSwitch content={btn.label} />
				</div>
			{/each}
		</div>
	</NavigationScope>
	<NavigationScope scopeName="nav-scope-3" discoveryMode="all-focusable">
		<div class="list list-3 content-surface">
			<h3>Scope AutoMark:</h3>
			{#each buttonsInfo1 as btn (btn.id)}
				<ButtonInputSwitch content={btn.label} />
			{/each}
		</div>
	</NavigationScope>
	<div class="controls">
		<h3>Controls:</h3>
		<NavigationScope scopeName="nav-scope-controls">
			<div class="list">
				<Button
					onclick={() => {
						console.debug('Refeshing Nodes Scope 1', { scopeName: scope1?.scopeId });
						scope1?.refreshNavigationTargets();
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
			</div>
		</NavigationScope>
	</div>
</div>

<style>
	.demo-container {
		gap: var(--space-4);
	}

	.element-container {
		display: grid;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
