<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import ObjectViewer from './ObjectViewer.svelte';
	import { mergeProps } from 'svelte-toolbelt';

	type Props = {
		objectName?: string;
		object?: object;
		recursive?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let { objectName, object, recursive = false, ...rest }: Props = $props();

	let objIterable = $derived.by(() => {
		if (!object) return [];

		if (object instanceof Map) {
			return [...object.entries()];
		}

		if (Array.isArray(object)) {
			return object.map((v, i) => [i, v]);
		}

		if (typeof object === 'object') {
			return Object.entries(object);
		}

		return [[typeof object, object]];
	});

	const mergedProps = $derived(mergeProps({ class: 'object-viewer' }, rest));
</script>

<div {...mergedProps}>
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
			{:else if typeof value === 'object'}
				<span class="value">{JSON.stringify($state.snapshot(value))}</span>
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
