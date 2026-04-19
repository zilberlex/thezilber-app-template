<script lang="ts">
	import type { CbAppEnv } from './command-builder-types';

	let { cbAppEnv }: { cbAppEnv: CbAppEnv } = $props();

	let cbRecordProjections = $derived.by(() => {
		let proj = cbAppEnv.allRecordProjections;
		proj.size;
		return proj.toValueArray();
	});
</script>

<nav class="command-builder-sidebar">
	<h2 class="menu-lable">Saved Commands:</h2>

	{#each cbRecordProjections as item (item.recordId)}
		<a
			href="/{cbAppEnv.baseUrlPath}/{item.slug}"
			class={['nav-collection-item', item.slug === cbAppEnv.slug && 'current-item']}
		>
			{item.projection.displayName}
		</a>
	{/each}
</nav>

<style>
	.command-builder-sidebar {
		--sidebar-item-width: 250px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		gap: var(--space-1);

		& > * {
			width: var(--sidebar-item-width);
			white-space: nowrap;
			overflow: hidden;
		}
	}

	.menu-lable {
		color: var(--cl-on-surface-dimmer);
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-3);
		font-weight: normal;
		width: var(--sidebar-item-width);
	}

	.nav-collection-item {
		font-size: var(--font-size-3);
		text-decoration: none;
		color: var(--cl-on-surface);
		padding: var(--space-1) var(--space-2);
		border-radius: 15px;
		width: var(--sidebar-item-width);

		&:is(:hover, :focus-visible, .current-item) {
			background-color: var(--cl-primary-dimmest);
		}
	}
</style>
