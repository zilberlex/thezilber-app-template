<script lang="ts">
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { flip, shift } from '@floating-ui/dom';
	import { offset } from '@floating-ui/dom';
	import { computePosition } from '@floating-ui/dom';

	let { children = null } = $props();
	let mouseX = $state(0);
	let mouseY = $state(0);

	const MOUSE_DIM = {
		width: 12,
		height: 20
	};

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	let mouseTrackerElement: HTMLElement;

	const virtualMouse = {
		getBoundingClientRect() {
			const x = mouseX;
			const y = mouseY;
			const width = MOUSE_DIM.width;
			const height = MOUSE_DIM.height;

			return {
				x,
				y,
				top: y,
				left: x,
				right: x + width,
				bottom: y + height,
				width: width,
				height: height
			};
		}
	};

	async function updatePosition() {
		if (!mouseTrackerElement) return;

		const { x, y } = await computePosition(virtualMouse as any, mouseTrackerElement, {
			placement: 'bottom-start',
			middleware: [
				offset({
					alignmentAxis: MOUSE_DIM.width + 1,
					crossAxis: 1,
					mainAxis: 1
				}),
				shift({
					padding: 8
				}),
				flip({
					fallbackPlacements: ['top-end'],
					padding: 8
				})
			]
		});

		mouseTrackerElement.style.left = `${x}px`;
		mouseTrackerElement.style.top = `${y}px`;
	}

	$effect(() => {
		if (!mouseTrackerElement) return;
		track(mouseX, mouseY);
		void updatePosition();
	});
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div class="mouse-tracker" bind:this={mouseTrackerElement}>
	{@render children?.()}
</div>

<style>
	.mouse-tracker {
		left: 0px;
		top: 0px;
		position: absolute;
	}
</style>
