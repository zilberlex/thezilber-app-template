<script lang="ts">
	import TooltipElement from '$lib/ui/basic-components/TooltipElement.svelte';
	import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import type { TooltipEntry } from './tooltip-manager.svelte';

	type Props = { entry: TooltipEntry };

	let { entry }: Props = $props();

	let el: HTMLElement | undefined = $state();

	async function position() {
		if (!el) return;

		const { x, y } = await computePosition(entry.anchorElement, el, {
			placement: entry.floatingPlacement,
			middleware: [
				offset({ alignmentAxis: 1, crossAxis: 1, mainAxis: 1 }),
				shift({ padding: 8 }),
				flip({ fallbackPlacements: ['top-end'], padding: 8 })
			]
		});

		el.style.left = `${x}px`;
		el.style.top = `${y}px`;
	}

	$effect(() => {
		if (!el || !entry.anchorElement) return;
		entry.anchorElement;
		el;

		const cleanup = autoUpdate(entry.anchorElement, el, position, {
			ancestorScroll: true,
			ancestorResize: true,
			elementResize: true,
			layoutShift: true
		});

		return () => {
			cleanup();
		};
	});
</script>

<TooltipElement bind:thisElement={el} variant={entry.variant} style="position: absolute;">
	{@render entry.tooltipContent()}
</TooltipElement>
