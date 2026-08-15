<script lang="ts">
	import { browser } from '$app/environment';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { getNavigationManager } from '$lib/engine/keyboard-navigation/svelte-components/navigation-manager-provider.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';

	let buttonsInfo1 = ['Button1', 'Button2', 'Button3'];

	let navigationManager = getNavigationManager();
	onMount(() => {
		if (browser) {
			navigationManager.assignScopeNavigationKeys([hotkey('tab')], [hotkey('tab', 'shift')]);
		}
	});
</script>

<div class="demo-container ly-center">
	<NavigationScope scopeName="nav-scope-1">
		<div class="list list-1 content-surface">
			{#each buttonsInfo1 as btn}
				<Button>
					{btn}
				</Button>
			{/each}
		</div>
	</NavigationScope>
	<NavigationScope scopeName="nav-scope-2">
		<div class="list list-2 content-surface">
			{#each buttonsInfo1 as btn}
				<Button>
					{btn}
				</Button>
			{/each}
		</div>
	</NavigationScope>
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
