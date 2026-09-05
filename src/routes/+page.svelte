<script lang="ts">
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/configurations';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { getRoutes } from '$lib/scripts/get-routes';
	import LinkTree from '$lib/ui/components/misc/LinkTree.svelte';

	const m = getRoutes();
	appState.pageContext.title = 'Application-List';
</script>

<NavigationScope navigationKeys={NavigationKeysConfigSets.Vertical} scopeId="link-tree">
	<LinkTree urls={m} />
</NavigationScope>
