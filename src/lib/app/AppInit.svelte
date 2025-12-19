<script>
	import { browser } from '$app/environment';
	import { getAgentType } from '$lib/engine/agent/agent-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onMount } from 'svelte';
	import HotKeysInitialization from '$lib/engine/keyboard-navigation/svelte-components/HotKeysInitialization.svelte';
	import HotkeyTooltip from '$lib/engine/tooltip/HotkeyTooltip.svelte';
	import TooltipTracker from '$lib/engine/tooltip/TooltipTracker.svelte';
	import ForegroundHoverLayer from '$lib/ui/components/ForegroundHoverLayer.svelte';
	import MouseTracker from '$lib/ui/components/MouseTracker.svelte';
	import DebugConsole from './DebugConsole.svelte';

	onMount(() => {
		if (browser) {
			appState.userAgent = window.navigator.userAgent;
			appState.userAgentType = getAgentType(appState.userAgent);

			window.appState = appState;
		}
	});

	$effect(() => {});
</script>

<HotKeysInitialization />
<TooltipTracker />

<ForegroundHoverLayer>
	{#if appState.userAgentType === 'desktop'}
		<MouseTracker>
			<HotkeyTooltip />
		</MouseTracker>
	{/if}
	{#if appState.debugConsole}
		<DebugConsole />
	{/if}
</ForegroundHoverLayer>
