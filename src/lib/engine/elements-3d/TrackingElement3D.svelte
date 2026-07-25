<script
	lang="ts"
	generics="
		TSurface extends ChildCapableRenderable = ChildCapableRenderable,
		TFace extends AnyRenderable = AnyRenderable,
		TBackFace extends AnyRenderable = AnyRenderable
	"
>
	import { untrack } from 'svelte';

	import { calculateTrackingRotation } from '$lib/engine/math-utils/trackball-algorithms';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import type { AnyRenderable, ChildCapableRenderable } from '$lib/engine/ui-infra/composable-renderable';

	import Element3D from './Element3D.svelte';
	import type { TrackingElement3DProps } from './types';

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

	let shouldTrack = $state(false);
	let trackingAreaElementDefault = $state<HTMLElement>();

	$effect(() => {
		track(trackingAreaElement, trackingAreaElementDefault);

		return untrack(() => {
			if (!trackingAreaElement) {
				trackingAreaElement = trackingAreaElementDefault;
			}

			const abortController = new AbortController();
			const { signal } = abortController;

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
