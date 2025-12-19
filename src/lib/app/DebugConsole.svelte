<script>
	import { appState } from '$lib/engine/state/application-state.svelte';
	import ObjectViewer from '$lib/ui/components/ObjectViewer.svelte';
</script>

<div class="debug-console">
	<ObjectViewer object={appState} class="app-state-viewer box" />
</div>

<style>
	.debug-console {
		opacity: 0.75;
		margin: var(--space-2);
	}

	:global(.app-state-viewer) {
		max-width: 400px;
	}
</style>
