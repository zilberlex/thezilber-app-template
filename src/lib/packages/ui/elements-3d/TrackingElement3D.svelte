<script
	lang="ts"
	generics="
		TSurface extends ChildCapableRenderable = ChildCapableRenderable,
		TFace extends AnyRenderable = AnyRenderable,
		TBackFace extends AnyRenderable = AnyRenderable
	"
>
	import { createSmartHandler } from '$lib/packages/core';

	import { calculateTrackingRotation, type TrackingSample } from '$lib/packages/core';
	import type { AnyRenderable, ChildCapableRenderable } from '$lib/packages/svelte/composable-renderable';
	import { untrack } from 'svelte';

	import Element3D from './Element3D.svelte';
	import type { TrackingElement3DProps } from './types';

	const TRACKING_COOLDOWN_MS = 20;

	let {
		thisElement = $bindable(),
		trackingAreaElement,
		trackingConfig = {
			mode: 'sphere-hyperbolic'
		},
		...element3DProps
	}: TrackingElement3DProps<TSurface, TFace, TBackFace> = $props();

	let rotateX = $state(0);
	let rotateY = $state(0);

	let trackingAreaElementDefault = $state<HTMLElement>();

	function resetTracking() {
		rotateX = 0;
		rotateY = 0;
	}

	function createTrackingHandler(element: HTMLElement) {
		return createSmartHandler(
			(event: PointerEvent) => {
				const rect = element.getBoundingClientRect();

				const trackingSample: TrackingSample = {
					localX: event.clientX - rect.left,
					localY: event.clientY - rect.top,
					planeWidth: rect.width,
					planeHeight: rect.height
				};

				const rotation = calculateTrackingRotation(trackingSample, trackingConfig);

				rotateX = rotation.rotateX;
				rotateY = rotation.rotateY;
			},
			{
				cooldownDelay: TRACKING_COOLDOWN_MS
			}
		);
	}

	// Change of tracking Area
	$effect(() => {
		const element = trackingAreaElement ?? trackingAreaElementDefault;

		return untrack(() => {
			resetTracking();

			if (!element) {
				return;
			}

			const abortController = new AbortController();
			const { signal } = abortController;

			element.addEventListener('pointermove', createTrackingHandler(element), { signal });
			element.addEventListener('pointerleave', resetTracking, { signal });
			element.addEventListener('pointercancel', resetTracking, { signal });

			return () => abortController.abort();
		});
	});
</script>

<div class="tracking-area" bind:this={trackingAreaElementDefault}>
	<div class="tracking-visual">
		<Element3D {...element3DProps} {rotateX} {rotateY} bind:thisElement />
	</div>
</div>

<style>
	.tracking-area {
		display: inline-grid;
	}

	.tracking-visual {
		display: inline-grid;
		pointer-events: none;
	}
</style>
