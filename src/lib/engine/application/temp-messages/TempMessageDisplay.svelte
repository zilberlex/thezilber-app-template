<script lang="ts">
	import { fade } from 'svelte/transition';
	import { temporaryMessageState } from './temporary-message-state.svelte';

	let isShowing = $derived(temporaryMessageState.isShowing);
</script>

{#if isShowing}
	<div class="temp-message-display" class:show={isShowing} transition:fade>
		{temporaryMessageState.message}
	</div>
{/if}

<style>
	.temp-message-display {
		position: absolute;
		right: var(--space-1);
		top: var(--space-1);
		max-width: 300px;
	}
</style>
