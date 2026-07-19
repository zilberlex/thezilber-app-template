<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { elementSurface } from './Snippets3DSurfaces.svelte';

	let {
		rotateX = 0,
		rotateY = 0,
		thisElement = $bindable(),
		front,
		back,
		surface = elementSurface,
		...rest
	}: {
		rotateX?: number;
		rotateY?: number;
		thisElement?: HTMLElement;

		front: Snippet;
		back?: Snippet;

		surface?: Snippet<[content: Snippet]>;
	} & HTMLAttributes<HTMLDivElement> = $props();
</script>

{#snippet faceContent()}
	<div class="three-d-face-stack">
		<div class="three-d-face front">
			{@render front()}
		</div>

		{#if back}
			<div class="three-d-face back">
				{@render back()}
			</div>
		{/if}
	</div>
{/snippet}

<div
	class="three-d-rotator"
	style:--rotate-x={`${rotateX}deg`}
	style:--rotate-y={`${rotateY}deg`}
	{...rest}
	bind:this={thisElement}
>
	{@render surface(faceContent)}
</div>

<style>
	.three-d-rotator {
		--transform-time: 700ms;
		--rotate-x: 0deg;
		--rotate-y: 0deg;

		width: 100%;

		transform-style: preserve-3d;
		transform: perspective(300px) rotateY(var(--rotate-y)) rotateX(var(--rotate-x));
		transition: transform var(--transform-time) ease-out;

		& > :global(*.surface-3d) {
			width: 100%;
			box-sizing: border-box;

			transform-style: preserve-3d;
			pointer-events: auto;
		}
	}

	.three-d-face-stack {
		display: inline-grid;
		transform-style: preserve-3d;

		/* Do not use pointer-events: none */
	}

	.three-d-face {
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
