<script lang="ts">
	import { createSmartHandler } from '$lib/packages/core/events/event-handling';
	import { navigationStateManager } from '$lib/engine/state/navigation-state.svelte';

	let onmousemove = createSmartHandler(
		() => {
			navigationStateManager.setMouseNavigationMode();
		},
		{ cooldownDelay: 20 }
	);
</script>

<svelte:window {onmousemove} />
