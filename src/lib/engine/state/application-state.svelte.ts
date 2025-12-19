import { tooltipState, type TooltipState } from '../tooltip/tooltip-state.svelte';
import { pageContext, type PageContext } from './page-context.svelte';

export interface AppState {
	isAppLoaded: boolean;
	isWindowFocused: boolean;
	debugConsole: boolean;
	debug: boolean;
	userAgent: string | undefined;
	userAgentType: 'desktop' | 'mobile' | undefined;
	currentFocusedNode: Element | undefined;
	inJsEnabled: boolean;
	tooltipState: TooltipState;
	pageContext: PageContext;
}

export const appState: AppState = $state({
	isWindowFocused: true,
	isAppLoaded: false,
	debugConsole: false,
	debug: false,
	userAgent: undefined,
	userAgentType: undefined,
	isMobile: undefined,
	currentFocusedNode: undefined,
	inJsEnabled: false,
	tooltipState: tooltipState,
	pageContext: pageContext
});
