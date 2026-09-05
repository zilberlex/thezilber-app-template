<script lang="ts">
	import { browser } from '$app/environment';
	import { createSoftKeyHandler } from '$lib/engine/hotkeys/bl-events';
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onDestroy, onMount } from 'svelte';

	let debugHotKey = new HotKey('F12', 'alt');
	let debugToggleMenuHotKey = new HotKey('F11', 'alt');
	let clearDebugObjectsHotKey = new HotKey('F10', 'alt');
	let showCustomizableDebugScreenHotKey = new HotKey('F8', 'alt');

	let undoHotKey = new HotKey('z', 'ctrl|option');
	let redoHotKey = new HotKey('z', 'ctrl|option', 'shift');

	let globalUndo = createSoftKeyHandler((e) => {
		appState.commandStack?.undo();
	});

	let globalRedo = createSoftKeyHandler(() => {
		appState.commandStack?.redo();
	});

	let debug = appState.debug;

	function toggleDebug() {
		let newMode = !debug.debugMode;
		debug.debugMode = newMode;
		debug.debugConsole = newMode;
	}

	function toggleDebugToggleMenu() {
		debug.debugToggleMenu = !debug.debugToggleMenu;
	}

	function clearDebugObjects() {
		debug.viewObjects.clear();
	}

	function toggleCustomDebugScreen() {
		debug.showCustomizableDebugScreen = !debug.showCustomizableDebugScreen;
	}

	onMount(() => {
		if (browser) {
			hotKeysModule.assignHotKey(debugHotKey, toggleDebug);
			hotKeysModule.assignHotKey(clearDebugObjectsHotKey, clearDebugObjects);
			hotKeysModule.assignHotKey(debugToggleMenuHotKey, toggleDebugToggleMenu);
			hotKeysModule.assignHotKey(showCustomizableDebugScreenHotKey, toggleCustomDebugScreen);

			hotKeysModule.assignHotKey(undoHotKey, globalUndo);
			hotKeysModule.assignHotKey(redoHotKey, globalRedo);
		}
	});

	onDestroy(() => {
		if (browser) {
			hotKeysModule.removeHotKey(debugHotKey, toggleDebug);
			hotKeysModule.removeHotKey(clearDebugObjectsHotKey, clearDebugObjects);
			hotKeysModule.removeHotKey(debugToggleMenuHotKey, toggleDebugToggleMenu);
			hotKeysModule.removeHotKey(showCustomizableDebugScreenHotKey, toggleCustomDebugScreen);

			hotKeysModule.removeHotKey(undoHotKey, globalUndo);
			hotKeysModule.removeHotKey(redoHotKey, globalRedo);
		}
	});
</script>
