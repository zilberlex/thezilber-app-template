<script>
	import { browser } from '$app/environment';
	import { getAgentType } from '$lib/engine/agent/agent-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onMount } from 'svelte';
	import HotKeysInitialization from '$lib/engine/keyboard-navigation/svelte-components/HotKeysInitialization.svelte';
	import TooltipTracker from '$lib/engine/tooltip/TooltipTracker.svelte';
	import ForegroundLayer from '$lib/ui/components/ForegroundLayer.svelte';
	import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';

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

<ForegroundLayer />
