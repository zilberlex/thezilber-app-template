<script lang="ts">
	import FlippableElement3D from './FlippableElement3D.svelte';
	import TrackingElement3D from './TrackingElement3D.svelte';

	let items = $state(['Apple', 'Bannana', 'Orange']);

	let content = $derived(items[0]);
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

		<TrackingElement3D>
			{#snippet front()}
				Mouse Tracker
			{/snippet}
		</TrackingElement3D>

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
