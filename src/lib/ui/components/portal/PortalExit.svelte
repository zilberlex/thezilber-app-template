<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';
	import { mergeProps } from 'svelte-toolbelt';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		layer: T;
		children?: Snippet;
	}

	const { layer, children, ...rest }: Props = $props();

	let mergedProps = $derived(mergeProps({ class: layer }, rest));
</script>

<div {...mergedProps}>
	{@render children?.()}
</div>
