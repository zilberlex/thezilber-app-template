<script lang="ts">
	import { NavigationKeysConfigSets } from '@svelte-ascend/keyboard-navigation';
	import {KeyboardNavigationScope} from '@svelte-ascend/keyboard-navigation/svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { getRoutes } from '$lib/scripts/get-routes';
	import LinkTree from '$lib/ui/components/misc/LinkTree.svelte';

	const m = getRoutes();
	appState.pageContext.title = 'Application-List';
</script>

<KeyboardNavigationScope navigationKeys={NavigationKeysConfigSets.Vertical} scopeId="link-tree">
	<LinkTree urls={m} />
</KeyboardNavigationScope>
