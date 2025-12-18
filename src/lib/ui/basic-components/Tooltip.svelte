<script lang="ts">
	import { quadInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	let { children, thisElement = $bindable(), ...rest } = $props();
</script>

<div class="tooltip-wrapper" transition:slide={{ axis: 'x', duration: 300, easing: quadInOut }}>
	<div bind:this={thisElement} class="app-tooltip" {...rest}>
		{@render children()}
	</div>
</div>

<style>
	/* .tooltip-wrapper fixes issues with slide transition content autofitting */
	.tooltip-wrapper {
		border: var(--base-border-thin);

		.app-tooltip {
			border: none;
		}
	}
</style>
