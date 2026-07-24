<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	let { component: CurrentComponent, componentProps, content }: {
		component: Component<any>;
		componentProps: Record<string, any>;
		content?: Snippet;
	} = $props();
</script>

{#if content}
	<CurrentComponent {...componentProps} children={content} />
{:else}
	<CurrentComponent {...componentProps} />
{/if}
