<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		class: userClass,
		...rest
	}: {
		children: Snippet;
	} & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...rest} class={['td-default-surface', userClass]}>
	{@render children()}
</div>

<style>
	.td-default-surface {
		--td-default-surface-radius: 0.45rem;

		color: var(--cl-on-primary);
		background-color: var(--cl-background);

		border: var(--border-thick) solid var(--cl-primary);
		border-radius: var(--td-default-surface-radius);

		padding: var(--space-2) var(--space-4);

		line-height: var(--sp-line-height);

		box-shadow:
			0 0 4px var(--color-1-transparent),
			0 0 8px transparent;
	}
</style>
