<script lang="ts">
	import { TRACKING_MODES } from '$lib/engine/math-utils/trackball-algorithms';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import FlippableElement3D from './FlippableElement3D.svelte';
	import TrackingElement3D from './TrackingElement3D.svelte';

	let items = $state(['Apple', 'Bannana', 'Orange']);

	let content = $derived(items[0]);

	let trackBallAlgorithsm = TRACKING_MODES;
</script>

<div class="ly-center">
	<main>
		<FlippableElement3D>
			{#snippet front()}
				Flipper
			{/snippet}
			{#snippet back()}
				Back of Flipper
			{/snippet}
		</FlippableElement3D>

		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D trackingConfig={{ mode: trackingMode }}>
				{#snippet front()}
					Mouse Tracker {trackingMode}
				{/snippet}
			</TrackingElement3D>
		{/each}

		<TrackingElement3D>
			{#snippet surface(content)}
				<Button class="surface-3d">
					{@render content()}
				</Button>
			{/snippet}
			{#snippet front()}
				Tracking Button
			{/snippet}
		</TrackingElement3D>
	</main>
</div>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
