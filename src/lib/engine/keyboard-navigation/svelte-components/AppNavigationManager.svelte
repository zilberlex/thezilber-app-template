<script lang="ts">
	import { onDestroy, setContext } from 'svelte';
	import { NavigationManager } from '../navigation-manager';
	import type { NavigationKeysConfig } from '../types';
	import { signalNavigationHotkeyEvent } from '$lib/engine/hotkeys/bl-hotkeys-event-signals';

	interface Props {
		navigationKeyConfig?: NavigationKeysConfig;
		children?: any;
	}

	// TODO AZ Add navigation keys.
	let { navigationKeyConfig, children }: Props = $props();

	let navigationManager: NavigationManager = new NavigationManager(navigationKeyConfig);

	setContext('navigationManager', navigationManager);

	onDestroy(() => {
		navigationManager.destroy();
	});

	$effect(() => {
		const navManagerNavigationHotkeyHandlerDestroy = navigationManager.registerNavigationHandler(
			(obj) => {
				signalNavigationHotkeyEvent(obj.initiatingKey, obj.targetNode);
			}
		);

		return () => {
			navManagerNavigationHotkeyHandlerDestroy();
		};
	});
</script>

<!-- TODO AZ Remove container and check -->
<span class="navigation-manager">
	{@render children()}
</span>
