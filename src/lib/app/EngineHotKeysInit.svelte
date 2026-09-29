<script lang="ts">
	import { hotkeyManager } from '@svelte-ascend/hotkey-module';
	import { combineCleanups, kbKey } from '@svelte-ascend/core';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onMount } from 'svelte';

	let debugHotKey = kbKey('F12', 'alt');
	let debugToggleMenuHotKey = kbKey('F11', 'alt');
	let clearDebugObjectsHotKey = kbKey('F10', 'alt');
	let showCustomizableDebugScreenHotKey = kbKey('F8', 'alt');

	let undoHotKey = kbKey('z', 'ctrl|meta');
	let redoHotKey = kbKey('z', 'ctrl|meta', 'shift');

	let globalUndo = () => {
		appState.commandStack?.undo();
	};

	let globalRedo = () => {
		appState.commandStack?.redo();
	};

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
		const cleanupAll = combineCleanups([
			hotkeyManager.assignHotKey(debugHotKey, toggleDebug),
			hotkeyManager.assignHotKey(clearDebugObjectsHotKey, clearDebugObjects),
			hotkeyManager.assignHotKey(debugToggleMenuHotKey, toggleDebugToggleMenu),
			hotkeyManager.assignHotKey(showCustomizableDebugScreenHotKey, toggleCustomDebugScreen),
			hotkeyManager.assignHotKey(undoHotKey, globalUndo),
			hotkeyManager.assignHotKey(redoHotKey, globalRedo)
		]);

		return cleanupAll;
	});
</script>
