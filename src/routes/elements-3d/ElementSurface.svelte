<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		class: classProps,
		...rest
	}: {
		children: Snippet;
	} & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={['element-surface', classProps]} {...rest}>
	{@render children()}
</div>

<style>
	.element-surface {
		display: grid;

		padding: var(--space-2) var(--space-4);

		border: var(--border-thick) solid var(--cl-primary);
		border-radius: var(--shape-element-radius);
		clip-path: var(--shape-element-clip);
		mask: var(--shape-element-mask);

		background-color: var(--cl-background);
	}
</style>
