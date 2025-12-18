<script lang="ts">
	import { cubicIn, cubicOut, expoIn, expoOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let { children, thisElement = $bindable(), ...rest } = $props();
</script>

<div
	bind:this={thisElement}
	class="app-tooltip"
	transition:fade={{ duration: 400, easing: expoOut }}
	{...rest}
>
	{@render children()}
</div>
