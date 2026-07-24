<script lang="ts">
	import FlippableElement3D from '$lib/engine/elements-3d/FlippableElement3D.svelte';
	import { buttonSurface3d } from '$lib/engine/elements-3d/Snippets3DSurfaces.svelte';
	import TrackingElement3D from '$lib/engine/elements-3d/TrackingElement3D.svelte';
	import { TRACKING_MODES } from '$lib/engine/math-utils/trackball-algorithms';
	import { componentSurface } from '$lib/engine/ui-infra/composable-renderable/composable-renderable-factories';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let items = $state(['Apple', 'Bannana', 'Orange']);

	let content = $derived(items[0]);

	let trackBallAlgorithsm = TRACKING_MODES;
</script>

<div class="ly-center">
	<main>
		<!-- <FlippableElement3D> -->
		<!-- 	{#snippet front()} -->
		<!-- 		Flipper -->
		<!-- 	{/snippet} -->
		<!-- 	{#snippet back()} -->
		<!-- 		Back of Flipper -->
		<!-- 	{/snippet} -->
		<!-- </FlippableElement3D> -->

		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D trackingConfig={{ mode: trackingMode }} compensateFaceScale={false}>
				Mouse Tracker {trackingMode}
			</TrackingElement3D>
		{/each}

		<TrackingElement3D surface={componentSurface(Button)} compensateFaceScale={false}>
			Tracking Button Not Compensated
		</TrackingElement3D>
		<TrackingElement3D surface={componentSurface(Button)} compensateFaceScale={true}>
			{#snippet front()}
				Tracking Button Compensated
			{/snippet}
		</TrackingElement3D>
		<Button>Normal Button</Button>
	</main>
</div>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
