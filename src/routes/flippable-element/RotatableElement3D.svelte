<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		rotateX = 0,
		rotateY = 0,
		thisElement = $bindable(),
		front,
		back,
		...rest
	}: {
		rotateX?: number;
		rotateY?: number;
		thisElement?: HTMLElement;
		front: Snippet;
		back?: Snippet;
	} & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={['three-d-card']}
	style:--rotate-x={`${rotateX}deg`}
	style:--rotate-y={`${rotateY}deg`}
	{...rest}
	bind:this={thisElement}
>
	<div class="three-d-card-content front">
		{@render front()}
	</div>

	<div class="three-d-card-content back">
		{@render back?.()}
	</div>
</div>

<style>
	.three-d-card {
		--transform-time: 700ms;
		--rotate-x: 0deg;
		--rotate-y: 0deg;

		display: inline-grid;

		padding: var(--space-2) var(--space-4);

		border: var(--border-thick) solid var(--cl-primary);
		border-radius: var(--shape-element-radius);
		clip-path: var(--shape-element-clip);
		mask: var(--shape-element-mask);

		background-color: var(--cl-background);

		transform-style: preserve-3d;
		transform: perspective(300px) rotateY(var(--rotate-y)) rotateX(var(--rotate-x));
		transition: transform var(--transform-time) ease-out;
	}

	.three-d-card-content {
		grid-row: 1;
		grid-column: 1;

		display: grid;
		place-items: center;

		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.front {
		transform: translateZ(7px);
	}

	.back {
		transform: translateZ(-7px) rotateX(180deg);
	}
</style>
