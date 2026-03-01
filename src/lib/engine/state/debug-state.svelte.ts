export interface DebugState {
	debugConsole: boolean;
	debugMode: boolean;
	viewObject?: object;
}

export const debugState: DebugState = $state({
	debugConsole: false,
	debugMode: false,
	viewObject: undefined
});
