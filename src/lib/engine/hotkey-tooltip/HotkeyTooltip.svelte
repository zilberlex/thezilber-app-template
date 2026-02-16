<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import TooltipElement from '$lib/ui/basic-components/TooltipElement.svelte';

	let { thisElement = $bindable(), show = $bindable() } = $props();

	let text = $derived(appState.tooltipState.text);

	function makePretty(text: string) {
		const highlighCssClass = 'ul-txt-primary';
		const output = text.replace(/[()*|]/g, `<span class="${highlighCssClass}">$&</span>`);

		return output;
	}

	$effect(() => {
		show = Boolean(text);
	});
</script>

{#if text}
	<TooltipElement bind:thisElement>
		{@html makePretty(text)}
	</TooltipElement>
{/if}
