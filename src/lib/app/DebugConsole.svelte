<script>
	import { appState } from '$lib/engine/state/application-state.svelte';
	import ObjectViewer from '$lib/ui/components/ObjectViewer.svelte';
</script>

<div class="debug-console content-surface">
	<ObjectViewer objectName="App State" object={appState} class="app-state-viewer content-surface" />
	<ObjectViewer objectName="Debug State" object={appState.debug} class="app-state-viewer content-surface" />
	{#if appState.debug.viewObject}
		<ObjectViewer
			objectName="Debug View Object"
			object={appState.debug.viewObject}
			recursive={true}
			class="app-state-viewer content-surface"
		/>
	{/if}
	{#each appState.debug.viewObjects.keys() as key}
		<ObjectViewer
			objectName={key}
			object={appState.debug.viewObjects.get(key)}
			recursive={true}
			class="app-state-viewer content-surface"
		/>
	{/each}
</div>

<style>
	.debug-console {
		position: absolute;
		opacity: 0.75;
		inset: var(--space-2);
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		max-width: 100%;
		overflow: scroll;
	}

	:global(.app-state-viewer) {
		max-width: 400px;
	}

	:global(.btn) {
		pointer-events: auto;
	}
</style>
