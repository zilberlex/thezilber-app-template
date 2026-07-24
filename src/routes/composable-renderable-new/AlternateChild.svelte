<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { ProbeProps } from './probe-types';

	let {
		siteId,
		label,
		onMountProbe,
		onDestroyProbe,
		onInternalChange,
		onInputChange
	}: ProbeProps = $props();

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

	function incrementInternalCount() {
		internalCount += 10;
		onInternalChange(internalCount);
	}

	function reportInputValue() {
		onInputChange(input.value);
	}
</script>

<article bind:this={root} class="child alternate" data-site-id={siteId}>
	<header>
		<strong>AlternateChild</strong>
		<span>{label}</span>
	</header>

	<button type="button" onclick={incrementInternalCount}>
		Local count: {internalCount}
	</button>

	<label>
		Uncontrolled input
		<input
			bind:this={input}
			value={`alternate-${siteId}`}
			oninput={reportInputValue}
		/>
	</label>
</article>

<style>
	.child {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border: 2px dashed currentColor;
		border-radius: 0.5rem;
	}

	header,
	label {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		justify-content: space-between;
	}

	input {
		min-width: 12rem;
	}
</style>
