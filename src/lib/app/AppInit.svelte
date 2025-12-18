<script>
	import HotKeysInitialization from '$lib/engine/keyboard-navigation/svelte-components/HotKeysInitialization.svelte';
	import HotkeyTooltip from '$lib/engine/tooltip/HotkeyTooltip.svelte';
	import TooltipTracker from '$lib/engine/tooltip/TooltipTracker.svelte';
	import ForegroundHoverLayer from '$lib/ui/components/ForegroundHoverLayer.svelte';
	import MouseTracker from '$lib/ui/components/MouseTracker.svelte';
</script>

<HotKeysInitialization />
<TooltipTracker />

<ForegroundHoverLayer>
	<MouseTracker>
		<HotkeyTooltip />
	</MouseTracker>
</ForegroundHoverLayer>
