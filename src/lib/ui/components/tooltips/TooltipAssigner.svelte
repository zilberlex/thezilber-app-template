<script lang="ts">
	import { untrack } from 'svelte';
	import { tooltipManager } from './tooltip-manager.svelte';
	import type { Placement, VirtualElement } from '@floating-ui/dom';
	import type { TooltipVariant } from '$lib/ui/basic-components/TooltipElement.svelte';

	type TooltipProps = {
		show?: boolean;
		anchorElement: Element | VirtualElement;
		variant?: TooltipVariant;
		children: any;
		floatingPlacement?: Placement;
	};

	let {
		show = true,
		anchorElement,
		children,
		variant = 'info',
		floatingPlacement = 'bottom-start'
	}: TooltipProps = $props();

	$effect(() => {
		if (!show || !anchorElement) return;

		return untrack(() => {
			const unregister = tooltipManager.register({
				anchorElement,
				tooltipContent: children,
				variant,
				floatingPlacement
			});

			return () => unregister();
		});
	});
</script>
