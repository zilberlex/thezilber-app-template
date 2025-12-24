<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import ObjectViewer from './ObjectViewer.svelte';

	type Props = {
		object: Object;
		recursive?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let { object, recursive = false, ...rest }: Props = $props();

	let objIterable = $derived.by(() => Object.entries(object));
</script>

<div {...rest}>
	{#each objIterable as [key, value]}
		<div class="item">
			<span class="key">{key}</span>:
			{#if recursive && typeof value === 'object'}
				<div>
					{'{'}<br /><ObjectViewer object={value} {recursive} />{'}'}<br />
				</div>
			{:else}
				<span class="value">{value}</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
	}

	.item {
		display: flex;
		flex-direction: row;
	}

	.key {
		color: var(--cl-primary);
		font-weight: bold;
	}

	.value {
		font-style: italic;
	}
</style>
