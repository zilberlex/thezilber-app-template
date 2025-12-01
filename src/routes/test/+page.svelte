<script lang="ts">
	import { getRoutes } from '$lib/scripts/get-routes';
	import LinkTree from '$lib/ui/components/misc/LinkTree.svelte';

	const m = getRoutes();
</script>

<LinkTree urls={m} />
