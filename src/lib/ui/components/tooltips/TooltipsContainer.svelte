<script lang="ts">
	import { tooltipManager } from './tooltip-manager.svelte';
	import TooltipMountFloat from './TooltipMountFloat.svelte';
</script>

{#each tooltipManager.entries as t (t.id)}
	<TooltipMountFloat entry={t} />
{/each}
