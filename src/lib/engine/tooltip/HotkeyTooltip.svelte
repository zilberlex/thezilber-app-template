<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import Tooltip from '$lib/ui/basic-components/Tooltip.svelte';

	let { thisElement = $bindable() } = $props();

	let text = $derived(appState.tooltipState.text);

	function makePretty(text: string) {
		const highlighCssClass = 'ul-txt-primary';
		const output = text.replace(/[()*|]/g, `<span class="${highlighCssClass}">$&</span>`);

		return output;
	}
</script>

{#if text}
	<Tooltip bind:thisElement>
		{@html makePretty(text)}
	</Tooltip>
{/if}
