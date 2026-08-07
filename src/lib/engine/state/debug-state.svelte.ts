import { SvelteMap } from 'svelte/reactivity';

export interface DebugState {
	debugConsole: boolean;
	debugMode: boolean;
	debugToggleMenu: boolean;
	viewObjects: SvelteMap<string, any>;
	viewObject?: any;
}

export const debugState: DebugState = createDebugState();

export function createDebugState(): DebugState {
	let debugConsole = $state(false);
	let debugMode = $state(false);
	let debugToggleMenu = $state(false);
	let viewObjects = $state(new SvelteMap<string, any>());
	let viewObject = $state<object | undefined>();

	return {
		get debugConsole() {
			return debugConsole;
		},
		set debugConsole(v: boolean) {
			debugConsole = v;
		},

		get debugMode() {
			return debugMode;
		},
		set debugMode(v: boolean) {
			debugMode = v;
		},

		get viewObjects() {
			return viewObjects;
		},

		get viewObject() {
			return viewObject;
		},
		set viewObject(v: object | undefined) {
			viewObject = v;
		},
		get debugToggleMenu() {
			return debugToggleMenu;
		},
		set debugToggleMenu(v: boolean) {
			debugToggleMenu = v;
		}
	};
}
