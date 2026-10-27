<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { getTabsContext } from './tabs-context';

	let {
		name,
		color,
		href,
		children
	}: {
		name: string;
		color?: string;
		href: string;
		children: Snippet;
	} = $props();

	const context = getTabsContext();
	const id = Symbol();

	onMount(() => context.register({ id, name, color, href, content: children }));
</script>
