import { tooltipState, type TooltipState } from '../tooltip/tooltip-state.svelte';

export interface AppState {
	isAppLoaded: boolean;
	isWindowFocused: boolean;
	debugConsole: boolean;
	debug: boolean;
	userAgent: string | undefined;
	isMobile: boolean | undefined;
	currentFocusedNode: Element | undefined;
	inJsEnabled: boolean;
	tooltipState: TooltipState;
}

export const appState: AppState = $state({
	isWindowFocused: true,
	isAppLoaded: false,
	debugConsole: false,
	debug: false,
	userAgent: undefined,
	isMobile: undefined,
	currentFocusedNode: undefined,
	inJsEnabled: false,
	tooltipState: tooltipState
});
