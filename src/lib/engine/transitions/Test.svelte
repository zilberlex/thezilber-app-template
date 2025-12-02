<script lang="ts">
	import { tick } from 'svelte';
	import { count } from './count';
	import { createNumberByDigitsTween } from '../animation/animations/animate-number-by-digits';

	let open = $state(false);
</script>

<div class="center">
	<button
		onclick={async () => {
			open = false;
			await tick();
			open = true;
		}}>Reset Counter</button
	>
	<div class="center counter-container">
		{#if open}
			<span in:count={{ from: 0, to: 9999 }}></span>
			<span in:count={{ tween: createNumberByDigitsTween(0, 9999) }}></span>
		{/if}
	</div>
</div>

<style>
	.center {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.counter-container {
		width: 8ch;
		height: 2.5lh;
		border: 1px solid var(--secondary-color);
	}
</style>
