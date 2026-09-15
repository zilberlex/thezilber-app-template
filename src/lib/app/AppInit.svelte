<script lang="ts">
	import { browser } from '$app/environment';
	import { getAgentType } from '$lib/engine/agent/agent-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onMount } from 'svelte';
	import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
	import TooltipTracker from '$lib/engine/hotkey-tooltip/TooltipTracker.svelte';
	import ForegroundLayer from './ForegroundLayer.svelte';
	import EngineHotKeysInit from './EngineHotKeysInit.svelte';
	import NavigationStateManager from './NavigationStateManager.svelte';
	import EngineErrorHandler from './EngineErrorHandler.svelte';
	import HotKeysInitialization from '$lib/packages/hotkey-module/svelt-components/HotKeysInitialization.svelte';
	import KeyboardNavigationManager from '$lib/packages/keyboard-navigation/svelte-components/KeyboardNavigationManager.svelte';
	import { engineElementInteraction } from '$lib/engine/engine-hotkeys/engine-interactions';
	import StyleLoader from '$lib/packages/ui/svelte/StyleLoader.svelte';
	import HackerBlueTheme from '$lib/packages/ui/style/themes/hacker-blue/svelte/HackerBlueTheme.svelte';
	import Elements3DLoadStyles from '$lib/packages/ui/elements-3d/Elements3DLoadStyles.svelte';
	import HackerBlueElements3DStyles from '$lib/packages/ui/style/themes/hacker-blue/integrations/elements-3d/svelte/HackerBlueElements3DStyles.svelte';

	let { children } = $props();

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

<HotKeysInitialization />
<NavigationStateManager />
<TooltipTracker />

<ForegroundLayer />

<EngineHotKeysInit />

<StyleLoader theme={HackerBlueTheme} extensions={[Elements3DLoadStyles, HackerBlueElements3DStyles]}>
	<KeyboardNavigationManager elementInteraction={engineElementInteraction}>
		<EngineErrorHandler />
		{@render children()}
	</KeyboardNavigationManager>
</StyleLoader>
