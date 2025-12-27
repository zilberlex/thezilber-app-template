export interface DebugState {
	debugConsole: boolean;
	debugMode: boolean;
	viewObject?: any;
}

export const debugState: DebugState = $state({
	debugConsole: false,
	debugMode: false,
	viewObject: undefined
});
