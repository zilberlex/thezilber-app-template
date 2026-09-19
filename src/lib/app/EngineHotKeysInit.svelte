<script lang="ts">
	import { browser } from '$app/environment';
	import { createHotKeyHandler } from '../../../packages/hotkey-module/src/lib';
	import { hotKeysModule } from '../../../packages/hotkey-module/src/lib';
	import { kbKey } from '@svelte-ascend/core';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onDestroy, onMount } from 'svelte';

	let debugHotKey = kbKey('F12', 'alt');
	let debugToggleMenuHotKey = kbKey('F11', 'alt');
	let clearDebugObjectsHotKey = kbKey('F10', 'alt');
	let showCustomizableDebugScreenHotKey = kbKey('F8', 'alt');

	let undoHotKey = kbKey('z', 'ctrl|meta');
	let redoHotKey = kbKey('z', 'ctrl|meta', 'shift');

	let globalUndo = createHotKeyHandler((e) => {
		appState.commandStack?.undo();
	});

	let globalRedo = createHotKeyHandler(() => {
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
