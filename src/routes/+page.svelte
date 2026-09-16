<script lang="ts">
	import { NavigationKeysConfigSets } from '$lib/packages/keyboard-navigation/configurations';
	import NavigationScope from '$lib/packages/keyboard-navigation/svelte/NavigationScope.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { getRoutes } from '$lib/scripts/get-routes';
	import LinkTree from '$lib/ui/components/misc/LinkTree.svelte';

	const m = getRoutes();
	appState.pageContext.title = 'Application-List';
</script>

<NavigationScope navigationKeys={NavigationKeysConfigSets.Vertical} scopeId="link-tree">
	<LinkTree urls={m} />
</NavigationScope>
