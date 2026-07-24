<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, count = 0, children }: {
		label: string;
		count?: number;
		children?: Snippet;
	} = $props();
</script>
<section><strong>{label}</strong><span>{count}</span>{@render children?.()}</section>
