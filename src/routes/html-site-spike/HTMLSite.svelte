<script lang="ts" generics="TTag extends keyof HTMLElementTagNameMap">
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';

	let {
		tag,
		elementProps,
		children
	}: {
		tag: TTag;
		elementProps: Omit<SvelteHTMLElements[TTag], 'children'>;
		children?: Snippet;
	} = $props();
</script>

<svelte:element this={tag} {...elementProps}>
	{@render children?.()}
</svelte:element>
