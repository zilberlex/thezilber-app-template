<script lang="ts">
	import type { Snippet } from 'svelte';
	import { quadInOut } from 'svelte/easing';
	import type { HTMLAttributes } from 'svelte/elements';
	import { slide } from 'svelte/transition';

	export type TooltipVariant = 'info' | 'warn' | 'error';

	type Props = {
		thisElement?: HTMLElement;
		variant?: TooltipVariant;
		children: Snippet;
	} & HTMLAttributes<HTMLDivElement>;

	let { thisElement = $bindable(), variant = 'info', children, ...rest }: Props = $props();
</script>

<div
	bind:this={thisElement}
	class="app-tooltip"
	transition:slide={{ axis: 'x', duration: 300, easing: quadInOut }}
	data-tooltip-variant={variant}
	{...rest}
>
	<div class="tooltip-content">
		{@render children()}
	</div>
</div>
