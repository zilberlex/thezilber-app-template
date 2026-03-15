<script>
	import { appState } from '$lib/engine/state/application-state.svelte';
	import ObjectViewer from '$lib/ui/components/ObjectViewer.svelte';
</script>

<div class="debug-console">
	<ObjectViewer objectName="App State" object={appState} class="app-state-viewer box" />
	<ObjectViewer objectName="Debug State" object={appState.debug} class="app-state-viewer box" />
	{#if appState.debug.viewObject}
		<ObjectViewer
			objectName="Debug View Object"
			object={appState.debug.viewObject}
			recursive={true}
			class="app-state-viewer box"
		/>
	{/if}
	{#each appState.debug.viewObjects.keys() as key}
		<ObjectViewer
			objectName={key}
			object={appState.debug.viewObjects.get(key)}
			recursive={true}
			class="app-state-viewer box"
		/>
	{/each}
</div>

<style>
	.debug-console {
		opacity: 0.75;
		margin: var(--space-2);
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		height: 100%;
	}

	:global(.app-state-viewer) {
		max-width: 400px;
	}

	:global(.btn) {
		pointer-events: auto;
	}
</style>
