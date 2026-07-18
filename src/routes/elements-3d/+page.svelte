<script lang="ts">
	import { TRACKING_MODES } from '$lib/engine/math-utils/trackball-algorithms';
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

		<button>Flip</button>
	</main>
</div>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
