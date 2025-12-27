import { tooltipState, type TooltipState } from '../tooltip/tooltip-state.svelte';
import { pageContext, type PageContext } from './page-context.svelte';
import { debugState, type DebugState } from './debug-state.svelte';

export interface AppState {
	isAppLoaded: boolean;
	isWindowFocused: boolean;
	userAgent: string | undefined;
	userAgentType: 'desktop' | 'mobile' | undefined;
	currentFocusedNode: Element | undefined;
	inJsEnabled: boolean;
	tooltipState: TooltipState;
	pageContext: PageContext;
	deviceId: string | undefined;
	debug: DebugState;
}

export const appState: AppState = $state({
	isWindowFocused: true,
	isAppLoaded: false,
	userAgent: undefined,
	userAgentType: undefined,
	isMobile: undefined,
	currentFocusedNode: undefined,
	inJsEnabled: false,
	tooltipState: tooltipState,
	pageContext: pageContext,
	deviceId: undefined,
	debug: debugState
});
