import type { Snippet } from 'svelte';
import type { Placement, VirtualElement } from '@floating-ui/dom';
import type { TooltipVariant } from '$lib/ui/basic-components/TooltipElement.svelte';

export type TooltipEntry = {
	id: string;
	anchorElement: Element | VirtualElement;
	tooltipContent: Snippet;
	variant: TooltipVariant;
	floatingPlacement: Placement;
};

export type TooltipRegisterRequest = Omit<TooltipEntry, 'id'>;

export function createTooltipManager() {
	let list = $state<TooltipEntry[]>([]);

	function register(entry: TooltipRegisterRequest) {
		const id = crypto.randomUUID();
		list.push({ id, ...entry });

		return () => {
			const i = list.findIndex((x) => x.id === id);
			if (i !== -1) list.splice(i, 1);
		};
	}

	return {
		register,
		get entries() {
			return list;
		}
	};
}

export const tooltipManager = createTooltipManager();
