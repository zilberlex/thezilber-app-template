<script lang="ts">
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/types';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { getRoutes } from '$lib/scripts/get-routes';
	import LinkTree from '$lib/ui/components/misc/LinkTree.svelte';

	const m = getRoutes();
	appState.pageContext.title = 'Application-List';
</script>

<NavigationScope navigationKeys={NavigationKeysConfigSets.Vertical} scopeName="link-tree">
	<LinkTree urls={m} />
</NavigationScope>
