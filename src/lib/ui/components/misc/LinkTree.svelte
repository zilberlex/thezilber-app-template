<script lang="ts">
	import { resolve } from '$app/paths';

	const { urls } = $props();
</script>

<ul>
	{#each urls as url}
		<li><a href={resolve(url)}>{url}</a></li>
	{/each}
</ul>

<style>
	ul {
		font-size: var(--font-size-3);

		list-style-type: none;
	}
</style>
