<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { getRoutes } from '$lib/scripts/get-routes';
	import LinkTree from '$lib/ui/components/misc/LinkTree.svelte';

	const m = getRoutes();
	appState.pageContext.title = 'Application-List';
</script>

<LinkTree urls={m} />
