<script lang="ts">
	import DebugConsole from '$lib/app/DebugConsole.svelte';
	import TempMessageDisplay from '$lib/engine/application/temp-messages/TempMessageDisplay.svelte';
	import HotkeyTooltip from '$lib/engine/hotkey-tooltip/HotkeyTooltip.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import DialogAnchor from '$lib/ui/components/dialog/DialogAnchor.svelte';
	import MouseTracker from '$lib/ui/components/MouseTracker.svelte';
	import PortalExit from '$lib/ui/components/portal/PortalExit.svelte';
	import TooltipsContainer from '$lib/ui/components/tooltips/TooltipsContainer.svelte';
	import EngineDebugToggleMenu from './EngineDebugToggleMenu.svelte';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';

	let hotkeyTooltip = $state();
	let showHotkeyTooltip = $state(false);

	type EngineShellLayers = 'modal-layer' | 'tooltip-layer' | 'debug-layer' | 'application-layer';
</script>

<div class="application-foreground">
	<div class="layer modal-layer">
		<DialogAnchor dialogController={appState.dialogController} />
	</div>

	<PortalExit layer={'application-layer'}>
		<TempMessageDisplay />
	</PortalExit>

	<div class="layer tooltip-layer">
		{#if appState.userAgentType === 'desktop'}
			<MouseTracker shouldUpdatePos={showHotkeyTooltip}>
				<HotkeyTooltip bind:thisElement={hotkeyTooltip} bind:show={showHotkeyTooltip} />
			</MouseTracker>

			<!-- <TooltipAssigner -->
			<!-- 	anchorElement={mouseTrackerElement} -->
			<!-- 	show={showHotkeyTooltip} -->
			<!-- ></TooltipAssigner> -->
			<TooltipsContainer />
		{/if}
	</div>

	<div class="layer debug-layer">
		{#if appState.debug.debugConsole}
			<DebugConsole />
		{/if}
	</div>

	<div class="layer debug-modal-layer">
		<DialogAnchor dialogController={appState.debug.debugDialogController} />
	</div>
</div>

<Dialog bind:open={appState.debug.debugToggleMenu} dialogController={appState.debug.debugDialogController}>
	<EngineDebugToggleMenu />
</Dialog>

<style>
	.application-foreground {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 9999;
		height: 100dvh;

		:global(.layer) {
			position: absolute;
			inset: 0;
			min-height: 0;
		}
	}

	.modal-layer {
		z-index: 2000;
	}

	:global(.application-layer) {
		z-index: 3000;
	}

	.tooltip-layer {
		z-index: 4000;
	}

	.debug-layer {
		z-index: 8000;
	}

	.debug-modal-layer {
		z-index: 9000;
	}
</style>
