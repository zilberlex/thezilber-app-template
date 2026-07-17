<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import RotatableElement3D from './RotatableElement3D.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { lerp } from '$lib/engine/animation/math-utils';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import type { MousePos } from '$lib/engine/types/types';

	let {
		front
	}: {
		front: Snippet;
	} = $props();

	let rotateX = $state(0);
	let rotateY = $state(0);

	let shouldTrack = $state(false);

	let thisElement = $state<HTMLElement>();

	const dz = 50;
	const yMouseSensitivity = 1;
	const xMouseSensitivity = 1;

	type TrackingMode = 'plane' | 'hemisphere';

	const mode: TrackingMode = 'plane';

	$effect(() => {
		track(thisElement, appState.mousePos);

		untrack(() => {
			if (!thisElement) return;
			if (!shouldTrack) {
				rotateX = 0;
				rotateY = 0;
				return;
			}

			let calcRes = { rotateX: 0, rotateY: 0 };
			if (mode === 'plane') {
				calcRes = trackModePlane(appState.mousePos, thisElement, 50);
			}

			rotateX = calcRes.rotateX;
			rotateY = calcRes.rotateY;
		});
	});

	function trackModePlane(
		mousePos: MousePos,
		trackedElement: HTMLElement,
		mousePlaneZ: number,
		yMouseSensitivity: number = 1,
		xMouseSensitivity: number = 1
	) {
		const rect = trackedElement.getBoundingClientRect();

		const elementX = rect.left + rect.width / 2;
		const elementY = rect.top + rect.height / 2;

		const dx = mousePos.x - elementX;
		const dy = mousePos.y - elementY;

		const rotateYRadians = Math.atan2(dx, mousePlaneZ);

		const rotateXRadians = -Math.atan2(dy, Math.hypot(dx, mousePlaneZ));

		let rotateX = (yMouseSensitivity * (rotateXRadians * 180)) / Math.PI;
		let rotateY = (xMouseSensitivity * (rotateYRadians * 180)) / Math.PI;

		return { rotateX, rotateY };
	}
</script>

<div class="tracking-area" onmouseleave={() => (shouldTrack = false)} onmouseenter={() => (shouldTrack = true)}>
	<RotatableElement3D {rotateX} {rotateY} {front} bind:thisElement />
</div>
