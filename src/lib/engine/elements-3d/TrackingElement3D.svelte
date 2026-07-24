<script
	lang="ts"
	generics="
		TSurface extends Surface = Surface,
		TFace extends Face = Face,
		TBackFace extends Face = Face
	"
>
	import { untrack } from 'svelte';

	import { appState } from '$lib/engine/state/application-state.svelte';
	import { calculateTrackingRotation, type TrackingConfig } from '$lib/engine/math-utils/trackball-algorithms';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import type { Surface, Face } from '../ui-infra/composable-renderable/types';
	import type { DistributiveOmit } from '$lib/engine/types/utility-types';
	import type { Element3DProps } from './types';
	import Element3D from './Element3D.svelte';

	export type TrackingElement3DProps<
		TSurface extends Surface = Surface,
		TFace extends Face = Face,
		TBackFace extends Face = Face
	> = DistributiveOmit<Element3DProps<TSurface, TFace, TBackFace>, 'rotateX' | 'rotateY'> & {
		trackingConfig?: TrackingConfig;
		trackingAreaElement?: HTMLElement;
	};

	let {
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
		<Element3D {rotateX} {rotateY} {...element3DProps} />
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
