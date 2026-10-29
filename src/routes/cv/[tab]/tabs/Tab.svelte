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

	const unregister = getTabsContext().register({
		id: Symbol(),
		get name() {
			return name;
		},
		get color() {
			return color;
		},
		get href() {
			return href;
		},
		get content() {
			return children;
		}
	});

	onMount(() => unregister);
</script>
