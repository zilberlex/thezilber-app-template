<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import RotatableElement3D from './RotatableElement3D.svelte';
	import { calculateTrackingRotation, type TrackingConfig } from '$lib/engine/math-utils/trackball-algorithms';

	let {
		front,
		surface,
		trackingConfig = {
			mode: 'sphere-hyperbolic'
		}
	}: {
		front: Snippet;
		surface?: Snippet<[content: Snippet]>;
		trackingConfig?: TrackingConfig;
	} = $props();

	let rotateX = $state(0);
	let rotateY = $state(0);

	let shouldTrack = $state(false);

	/*
	 * Bind to the stable, untransformed interaction element.
	 */
	let trackingArea = $state<HTMLElement>();

	$effect(() => {
		const element = trackingArea;
		const active = shouldTrack;

		const mousePosition = appState.mousePos;

		const currentTracking = trackingConfig;

		untrack(() => {
			if (!element || !active) {
				rotateX = 0;
				rotateY = 0;
				return;
			}

			const rect = element.getBoundingClientRect();

			const rotation = calculateTrackingRotation(mousePosition, rect, currentTracking);

			rotateX = rotation.rotateX;
			rotateY = rotation.rotateY;
		});
	});
</script>

<div
	class="tracking-area"
	bind:this={trackingArea}
	onpointerleave={() => {
		shouldTrack = false;
	}}
	onpointerenter={() => {
		shouldTrack = true;
	}}
>
	<div class="tracking-visual">
		<RotatableElement3D {rotateX} {rotateY} {front} {surface} />
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
