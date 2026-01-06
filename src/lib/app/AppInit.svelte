<script>
	import { browser } from '$app/environment';
	import { getAgentType } from '$lib/engine/agent/agent-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onMount } from 'svelte';
	import HotKeysInitialization from '$lib/engine/keyboard-navigation/svelte-components/HotKeysInitialization.svelte';
	import HotkeyTooltip from '$lib/engine/tooltip/HotkeyTooltip.svelte';
	import TooltipTracker from '$lib/engine/tooltip/TooltipTracker.svelte';
	import ForegroundLayer from '$lib/ui/components/ForegroundLayer.svelte';
	import MouseTracker from '$lib/ui/components/MouseTracker.svelte';
	import DebugConsole from './DebugConsole.svelte';
	import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
	import DialogAnchor from '$lib/ui/components/dialog/DialogAnchor.svelte';

	onMount(() => {
		if (browser) {
			appState.userAgent = window.navigator.userAgent;
			appState.userAgentType = getAgentType(appState.userAgent);

			window.appState = appState;

			appState.deviceId = getDeviceId();
		}
	});
</script>

<HotKeysInitialization />
<TooltipTracker />

<ForegroundLayer>
	<div class="modal-layer">
		<DialogAnchor />
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
</ForegroundLayer>

<style>
	.modal-layer {
		z-index: 2000;
	}
	.tooltip-layer {
		z-index: 3000;
	}

	.debug-layer {
		z-index: 8000;
	}
</style>
