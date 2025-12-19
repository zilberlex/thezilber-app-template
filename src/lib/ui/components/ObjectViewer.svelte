<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		object: Object;
	} & HTMLAttributes<HTMLDivElement>;

	let { object, ...rest }: Props = $props();

	let objIterable = $derived.by(() => Object.entries(object));
</script>

<div {...rest}>
	{#each objIterable as [key, value]}
		<div>
			<span class="key">{key}</span>: <span class="value">{value}</span>
		</div>
	{/each}
</div>

<style>
	.key {
		color: var(--cl-primary);
		font-weight: bold;
	}

	.value {
		font-style: italic;
	}
</style>
