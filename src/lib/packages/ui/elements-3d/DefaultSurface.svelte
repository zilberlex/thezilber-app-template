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

<div {...rest} class={['element', userClass]}>
	{@render children()}
</div>
