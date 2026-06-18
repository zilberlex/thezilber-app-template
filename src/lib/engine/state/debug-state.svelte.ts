import { SvelteMap } from 'svelte/reactivity';

export interface DebugState {
	debugConsole: boolean;
	debugMode: boolean;
	viewObjects: SvelteMap<string, any>;
	viewObject?: any;
}

export const debugState: DebugState = createDebugState();

export function createDebugState(): DebugState {
	let debugConsole = $state(false);
	let debugMode = $state(false);
	let viewObjects = $state(new SvelteMap<string, any>());
	let viewObject = $state<object | undefined>();

	return {
		get debugConsole() {
			return debugConsole;
		},
		set debugConsole(value: boolean) {
			debugConsole = value;
		},

		get debugMode() {
			return debugMode;
		},
		set debugMode(value: boolean) {
			debugMode = value;
		},

		get viewObjects() {
			return viewObjects;
		},

		get viewObject() {
			return viewObject;
		},
		set viewObject(value: object | undefined) {
			viewObject = value;
		}
	};
}
