<script lang="ts">
	import FlippableElement3D from '$lib/engine/elements-3d/FlippableElement3D.svelte';
	import TrackingElement3D from '$lib/engine/elements-3d/TrackingElement3D.svelte';
	import { TRACKING_MODES } from '$lib/engine/math-utils/trackball-algorithms';
	import { componentRenderable, snippetRenderable } from '$lib/engine/ui-infra/composable-renderable';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let items = $state(['Apple', 'Bannana', 'Orange']);

	let content = $derived(items[0]);

	let trackBallAlgorithsm = TRACKING_MODES;
</script>

<div class="ly-center">
	<main>
		<FlippableElement3D>
			{#snippet face()}
				Flipper
			{/snippet}
			{#snippet backFace()}
				Back of Flipper
			{/snippet}
		</FlippableElement3D>

		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D trackingConfig={{ mode: trackingMode }} compensateFaceScale={false}>
				Mouse Tracker {trackingMode}
			</TrackingElement3D>
		{/each}

		{#snippet trackingFace()}
			Tracking Button Compensated
		{/snippet}

		<TrackingElement3D surface={componentRenderable(Button)} compensateFaceScale={false}>
			Tracking Button Not Compensated
		</TrackingElement3D>
		<TrackingElement3D
			surface={componentRenderable(Button)}
			compensateFaceScale={true}
			face={snippetRenderable(trackingFace)}
			faceProps={{}}
		></TrackingElement3D>
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
