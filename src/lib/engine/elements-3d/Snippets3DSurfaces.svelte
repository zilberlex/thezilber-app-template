<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import ElementSurface from './ElementSurface.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';

	export { elementSurface3d, noSurface, buttonSurface3d };
</script>

{#snippet elementSurface3d(content: Snippet)}
	<ElementSurface class="td-surface">
		{@render content()}
	</ElementSurface>
{/snippet}

{#snippet buttonSurface3d(content: Snippet)}
	<Button class="td-surface">
		{@render content()}
	</Button>
{/snippet}

{#snippet noSurface(content: Snippet)}
	{@render content()}
{/snippet}
