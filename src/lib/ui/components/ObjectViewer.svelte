<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import ObjectViewer from './ObjectViewer.svelte';

	type Props = {
		objectName?: string;
		object: Object;
		recursive?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let { objectName, object, recursive = false, ...rest }: Props = $props();

	function isObject(val: any) {
		return val === Object(val);
	}

	let objIterable = $derived.by(() =>
		isObject(object) ? Object.entries(object) : [[typeof object, object]]
	);
</script>

<div {...rest}>
	{#if objectName}
		<strong>{objectName}:</strong>
	{/if}
	{#each objIterable as [key, value]}
		<div class="item">
			<span class="key">{key}</span>:
			{#if recursive && typeof value === 'object' && value}
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

	strong {
		text-decoration: underline var(--cl-primary);
	}
</style>
