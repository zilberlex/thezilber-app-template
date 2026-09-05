<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';

	const { delayMs = 0, isVisible = true, children } = $props();
	// This element delays the freeze of elements when they leave the DOM - useful for application of animations.

	// svelte-ignore state_referenced_locally
	let isVisibleInternal = $state(isVisible);

	let lastTimeout: number | undefined = undefined;
	$effect(() => {
		clearTimeout(lastTimeout);
		if (!isVisible) {
			lastTimeout = setTimeout(() => {
				isVisibleInternal = false;
			}, delayMs);
		} else {
			isVisibleInternal = true;
		}

		return () => {
			clearTimeout(lastTimeout);
		};
	});

	$effect(() => {
		appState.debug.viewObject = isVisibleInternal;
	});
</script>

{#if isVisibleInternal}
	{@render children?.()}
{/if}
