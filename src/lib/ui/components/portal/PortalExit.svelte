<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		layer: T;
		children?: Snippet;
	}

	const { layer, children, ...rest }: Props = $props();
</script>

<div {...rest} class={layer}>
	{@render children?.()}
</div>
