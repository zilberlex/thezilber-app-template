<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { CbAppEnv } from './command-builder-types';

	let { cbAppEnv }: { cbAppEnv: CbAppEnv } = $props();

	let menuLabel: HTMLHeadingElement;
	let labelHeight = $state(0);
	let resizeObserver: ResizeObserver;

	let cbRecordProjections = $derived.by(() => {
		let proj = cbAppEnv.allRecordProjections;
		proj.size;
		return proj.toValueArray();
	});

	onMount(() => {
		const updateLabelHeight = () => {
			labelHeight = menuLabel?.offsetHeight ?? 0;
		};

		updateLabelHeight();

		resizeObserver = new ResizeObserver(updateLabelHeight);
		if (menuLabel) {
			resizeObserver.observe(menuLabel);
		}
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});
</script>

<nav class="command-builder-sidebar" style:--section-label-height={`${labelHeight}px`}>
	<section class="sidebar-section">
		<h2 bind:this={menuLabel} class="menu-label">Saved Commands:</h2>

		{#each cbRecordProjections as item (item.recordId)}
			<a
				href="/{cbAppEnv.baseUrlPath}/{item.slug}"
				class={['nav-collection-item', item.slug === cbAppEnv.slug && 'current-item']}
			>
				{item.projection.displayName}
			</a>
		{/each}
	</section>
</nav>

<style>
	.command-builder-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);

		& > * {
			width: 100%;
		}
	}

	.menu-label {
		color: var(--cl-on-surface-dimmer);
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-3);
		font-weight: normal;
		width: var(--sidebar-item-width);

		position: sticky;
		top: 0;
		z-index: 1;
		background-color: var(--cl-surface);
	}

	.sidebar-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.nav-collection-item {
		font-size: var(--font-size-3);
		text-decoration: none;
		color: var(--cl-on-surface);
		padding: var(--space-1) var(--space-2);
		border-radius: 15px;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: var(--sidebar-item-width);

		scroll-margin-block-start: var(--section-label-height);

		&:is(:hover, :focus-visible, .current-item) {
			background-color: var(--cl-primary-dimmest);
		}
	}
</style>
