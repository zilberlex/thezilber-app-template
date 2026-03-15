<script lang="ts">
	import { browser } from '$app/environment';
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onDestroy, onMount } from 'svelte';

	let debugHotKey = new HotKey('F12', 'alt');
	let clearDebugObjectsHotKey = new HotKey('F10', 'alt');
	let debug = appState.debug;

	function toggleDebug() {
		let newMode = !debug.debugMode;
		debug.debugMode = newMode;
		debug.debugConsole = newMode;
	}

	function clearDebugObjects() {
		debug.viewObjects.clear();
	}

	onMount(() => {
		if (browser) {
			hotKeysModule.assignHotKey(debugHotKey, toggleDebug);
			hotKeysModule.assignHotKey(clearDebugObjectsHotKey, clearDebugObjects);
		}
	});

	onDestroy(() => {
		if (browser) {
			hotKeysModule.removeHotKey(debugHotKey, toggleDebug);
			hotKeysModule.removeHotKey(clearDebugObjectsHotKey, clearDebugObjects);
		}
	});
</script>
