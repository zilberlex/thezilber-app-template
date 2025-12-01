export interface AppState {
	isAppLoaded: boolean;
	isWindowFocused: boolean;
	debugConsole: boolean;
	debug: boolean;
	userAgent: string | undefined;
	isMobile: boolean | undefined;
}

export const appState: AppState = $state({
	isWindowFocused: true,
	isAppLoaded: false,
	debugConsole: false,
	debug: false,
	userAgent: undefined,
	isMobile: undefined
});
