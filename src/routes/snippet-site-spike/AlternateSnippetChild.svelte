<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import type { SnippetProbeProps } from './probe-types';

	let {
		siteId,
		label,
		content,
		onMountProbe,
		onDestroyProbe,
		onInternalChange,
		onInputChange
	}: SnippetProbeProps & {
		content: Snippet;
	} = $props();
	let root: HTMLElement;
	let input: HTMLInputElement;
	let internalCount = $state(100);

	onMount(() => {
		onMountProbe(root);
		onInternalChange(internalCount);
		onInputChange(input.value);
	});

	onDestroy(() => {
		onDestroyProbe();
	});

	function increment() {
		internalCount += 10;
		onInternalChange(internalCount);
	}

	function reportInput() {
		onInputChange(input.value);
	}
</script>

<article bind:this={root} data-site-id={siteId}>
	<header>
		<strong>Alternate snippet child</strong>
		<span>{label}</span>
	</header>

	<button type="button" onclick={increment}>Local count: {internalCount}</button>
	<input bind:this={input} value={`alternate-${siteId}`} oninput={reportInput} />

	<div class="content">
		{@render content?.()}
	</div>
</article>

<style>
	article {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border: 2px dashed currentColor;
		border-radius: 0.5rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.content {
		padding: 0.5rem;
		border: 1px dashed currentColor;
	}
</style>
