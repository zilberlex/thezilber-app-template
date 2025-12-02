export interface AppState {
	isAppLoaded: boolean;
	isWindowFocused: boolean;
	debugConsole: boolean;
	debug: boolean;
	userAgent: string | undefined;
	isMobile: boolean | undefined;
	currentFocusedNode: Element | undefined;
	inJsEnabled: boolean;
}

export const appState: AppState = $state({
	isWindowFocused: true,
	isAppLoaded: false,
	debugConsole: false,
	debug: false,
	userAgent: undefined,
	isMobile: undefined,
	currentFocusedNode: undefined,
	inJsEnabled: false
});
