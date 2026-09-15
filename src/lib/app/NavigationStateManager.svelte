<script lang="ts">
	import { createSmartHandler } from '$lib/packages/core';
	import { navigationStateManager } from '$lib/engine/state/navigation-state.svelte';

	let onmousemove = createSmartHandler(
		() => {
			navigationStateManager.setMouseNavigationMode();
		},
		{ cooldownDelay: 20 }
	);
</script>

<svelte:window {onmousemove} />
