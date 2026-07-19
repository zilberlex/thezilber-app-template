<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import { calculateTrackingRotation, type TrackingConfig } from '$lib/engine/math-utils/trackball-algorithms';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import Element3D from './Element3D.svelte';

	let {
		front,
		surface,
		trackingAreaElement,
		trackingConfig = {
			mode: 'sphere-hyperbolic'
		}
	}: {
		front: Snippet;
		surface?: Snippet<[content: Snippet]>;
		trackingConfig?: TrackingConfig;
		trackingAreaElement?: HTMLElement;
	} = $props();

	let rotateX = $state(0);
	let rotateY = $state(0);

	let shouldTrack = $state(false);

	let trackingAreaElementDefault = $state<HTMLElement>();

	$effect(() => {
		track(trackingAreaElement, trackingAreaElementDefault);

		return untrack(() => {
			if (!trackingAreaElement) {
				trackingAreaElement = trackingAreaElementDefault;
			}

			let abortController = new AbortController();
			let { signal } = abortController;
			trackingAreaElement?.addEventListener('pointerenter', () => (shouldTrack = true), { signal });
			trackingAreaElement?.addEventListener('pointerleave', () => (shouldTrack = false), { signal });

			return () => abortController.abort();
		});
	});

	$effect(() => {
		const element = trackingAreaElement;
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

<div class="tracking-area" bind:this={trackingAreaElementDefault}>
	<div class="tracking-visual">
		<Element3D {rotateX} {rotateY} {front} {surface} />
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
