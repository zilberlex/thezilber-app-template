export type TooltipState = {
	target: Element | null;
	text: string | null;
};

export const tooltipState = $state<TooltipState>({
	target: null,
	text: null
});
