<script lang="ts">
	import DebugConsole from '$lib/app/DebugConsole.svelte';
	import TempMessageDisplay from '$lib/engine/application/temp-messages/TempMessageDisplay.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import HotkeyTooltip from '$lib/engine/tooltip/HotkeyTooltip.svelte';
	import DialogAnchor from './dialog/DialogAnchor.svelte';
	import MouseTracker from './MouseTracker.svelte';
</script>

<div class="application-foreground">
	<div class="modal-layer">
		<DialogAnchor />
	</div>

	<div class="application-layer">
		<TempMessageDisplay />
	</div>

	<div class="tooltip-layer">
		{#if appState.userAgentType === 'desktop'}
			<MouseTracker>
				<HotkeyTooltip />
			</MouseTracker>
		{/if}
	</div>

	{#if appState.debug.debugConsole}
		<div class="debug-layer">
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
