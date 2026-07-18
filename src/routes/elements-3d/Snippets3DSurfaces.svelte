<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import ElementSurface from './ElementSurface.svelte';

	export { elementSurface, noSurface };
</script>

{#snippet elementSurface(content: Snippet)}
	<ElementSurface class={'surface-3d'}>
		{@render content()}
	</ElementSurface>
{/snippet}

{#snippet noSurface(content: Snippet)}
	{@render content()}
{/snippet}
