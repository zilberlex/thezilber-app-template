<script lang="ts">
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import type { ActionsMenuEntry } from './action-menu-entry.svelte';
	import ToggleButton from './ToggleButton.svelte';

	const { actions }: { actions: ActionsMenuEntry[] } = $props();
</script>

<NavigationScope scopeName="actions-menu">
	<div class="actions-menu content-surface">
		{#each actions as action}
			<div class="action-controls">
				<div class="action-name">
					{action.name}
				</div>
				<ToggleButton bind:toggleState={action.toggle} onToggle={action.action} class="toggle-action" />
			</div>
		{/each}
	</div>
</NavigationScope>

<style>
	.actions-menu {
		display: flex;
		flex-direction: column;
		padding: var(--space-3) var(--space-3);
		gap: var(--space-2);

		width: 400px;
	}

	.action-controls {
		display: flex;
		flex-direction: row;

		gap: var(--space-8);
		justify-content: space-between;
		align-items: center;
	}
</style>
