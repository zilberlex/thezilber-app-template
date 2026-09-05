<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import TooltipElement from '$lib/ui/basic-components/TooltipElement.svelte';
	import DelayedDomTransitionElement from '$lib/ui/ui-helpers/DelayedDomTransitionElement.svelte';

	let { thisElement = $bindable(), show = $bindable() } = $props();

	let text = $derived(appState.tooltipState.text);
	let isVisible = $derived(Boolean(text && text != ''));

	let lastText = '';

	function makePretty(text: string | null) {
		const highlighCssClass = 'ul-txt-primary';
		const output = text?.replace(/[()*|]/g, `<span class="${highlighCssClass}">$&</span>`) ?? lastText;

		if (output) lastText = output;

		return output;
	}

	$effect(() => {
		show = Boolean(text);
	});

	$effect(() => {
		appState.debug.viewObjects.set('Hotkeytooltip isVisible', isVisible);
	});
</script>

<DelayedDomTransitionElement {isVisible} delayMs={300}>
	<TooltipElement bind:thisElement open={isVisible}>
		{@html makePretty(text)}
	</TooltipElement>
</DelayedDomTransitionElement>
