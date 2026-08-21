<script lang="ts">
	import { browser } from '$app/environment';
	import { getAgentType } from '$lib/engine/agent/agent-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onMount } from 'svelte';
	import HotKeysInitialization from '$lib/engine/keyboard-navigation/svelte-components/HotKeysInitialization.svelte';
	import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
	import TooltipTracker from '$lib/engine/hotkey-tooltip/TooltipTracker.svelte';
	import ForegroundLayer from './ForegroundLayer.svelte';
	import EngineHotKeysInit from './EngineHotKeysInit.svelte';
	import NavigationStateManager from './NavigationStateManager.svelte';
	import EngineErrorHandler from './EngineErrorHandler.svelte';

	onMount(() => {
		if (browser) {
			appState.userAgent = window.navigator.userAgent;
			appState.userAgentType = getAgentType(appState.userAgent);

			window.appState = appState;

			appState.deviceId = getDeviceId();
		}
	});

	function handleMouseMove(event: MouseEvent) {
		appState.mousePos = {
			x: event.clientX,
			y: event.clientY
		};
	}
</script>

<svelte:window onmousemove={handleMouseMove} />

<EngineErrorHandler />
<HotKeysInitialization />
<NavigationStateManager />
<TooltipTracker />

<ForegroundLayer />

<EngineHotKeysInit />
