<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { getTabsContext } from './tabs-context';

	let {
		name,
		color,
		children
	}: {
		name: string;
		color?: string;
		children: Snippet;
	} = $props();

	const context = getTabsContext();
	const id = Symbol();

	onMount(() => context.register({ id, name, color, content: children }));
</script>
