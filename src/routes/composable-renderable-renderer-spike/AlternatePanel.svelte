<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	let { label, revision, children }: { label: string; revision: number; children?: Snippet } = $props();
	let count = $state(100);
	onMount(() => { console.log('AlternatePanel mounted'); return () => console.log('AlternatePanel destroyed'); });
</script>
<article><strong>{label}</strong><span>Revision: {revision}</span><button type="button" onclick={() => (count += 1)}>Alternate local count: {count}</button>{@render children?.()}</article>
<style>article { display: grid; gap: 0.75rem; }</style>
