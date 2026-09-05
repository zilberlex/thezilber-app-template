<script lang="ts">
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { flip, shift, type FloatingElement, type VirtualElement } from '@floating-ui/dom';
	import { offset } from '@floating-ui/dom';
	import { computePosition } from '@floating-ui/dom';
	import { untrack } from 'svelte';

	let { children = null, shouldUpdatePos } = $props();
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

	let mouseTrackerElement: HTMLElement | undefined = $state();

	const virtualMouse: VirtualElement = {
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

	async function updatePosition(anchor: FloatingElement) {
		const { x, y } = await computePosition(virtualMouse, anchor, {
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

		anchor.style.left = `${x}px`;
		anchor.style.top = `${y}px`;
	}

	$effect(() => {
		if (!mouseTrackerElement || !shouldTrack) return;
		track(mouseX, mouseY);
		updatePosition(mouseTrackerElement);
	});

	let stopTrackingDelay = 0;
	let shouldTrack = $state(shouldUpdatePos);

	$effect(() => {
		track(shouldUpdatePos);

		return untrack(() => {
			if (shouldUpdatePos) {
				shouldTrack = true;
				return () => {};
			} else {
				let t = setTimeout(() => {
					shouldUpdatePos = false;
				}, stopTrackingDelay);

				return () => {
					clearTimeout(t);
				};
			}
		});
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
