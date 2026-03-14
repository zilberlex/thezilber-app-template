<script lang="ts">
	import DebugConsole from '$lib/app/DebugConsole.svelte';
	import TempMessageDisplay from '$lib/engine/application/temp-messages/TempMessageDisplay.svelte';
	import HotkeyTooltip from '$lib/engine/hotkey-tooltip/HotkeyTooltip.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import DialogAnchor from './dialog/DialogAnchor.svelte';
	import MouseTracker from './MouseTracker.svelte';
	import TooltipsContainer from './tooltips/TooltipsContainer.svelte';

	let hotkeyTooltip = $state();
	let showHotkeyTooltip = $state(false);
</script>

<div class="application-foreground">
	<div class="layer modal-layer">
		<DialogAnchor />
	</div>

	<div class="layer application-layer">
		<TempMessageDisplay />
	</div>

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

	{#if appState.debug.debugConsole}
		<div class="layer debug-layer">
			<DebugConsole />
		</div>
	{/if}
</div>

<style>
	.application-foreground {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 9999;
		height: 100dvh;

		.layer {
			position: absolute;
			inset: 0;
			min-height: 0;
		}
	}

	.modal-layer {
		z-index: 2000;
	}

	.application-layer {
		z-index: 3000;
	}

	.tooltip-layer {
		z-index: 4000;
	}

	.debug-layer {
		z-index: 8000;
	}
</style>
