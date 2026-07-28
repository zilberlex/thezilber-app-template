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

<main class="ly-center">
	<section>
		<h3>Flipper</h3>
		<FlippableElement3D>
			{#snippet face()}
				Flipper
			{/snippet}
			{#snippet backFace()}
				Back of Flipper
			{/snippet}
		</FlippableElement3D>
	</section>

	<section>
		<h3>Positive Depth</h3>
		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D trackingConfig={{ mode: trackingMode }} compensateFaceScale={true}>
				Mouse Tracker {trackingMode}
			</TrackingElement3D>
		{/each}
	</section>

	<section>
		<h3>Negative Depth (Surface Color Transparent by design)</h3>
		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D trackingConfig={{ mode: trackingMode }} compensateFaceScale={true}>
				Mouse Tracker {trackingMode}
			</TrackingElement3D>
		{/each}
	</section>

	<section>
		<h3>Buttons</h3>
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

		<TrackingElement3D surface={componentRenderable(Button)} compensateFaceScale={true} depth={-40}>
			Tracking Button Compensated Negative Depth
		</TrackingElement3D>
		<Button>Normal Button</Button>
	</section>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
