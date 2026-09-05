import { createDialogController, type DialogController } from '$lib/ui/components/dialog/dialog-contoller.svelte';
import type { Snippet } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export interface DebugState {
	debugConsole: boolean;
	debugMode: boolean;
	debugToggleMenu: boolean;
	viewObjects: SvelteMap<string, any>;
	viewObject?: any;
	readonly debugDialogController: DialogController;
	customizableDebugScreen?: Snippet;
	showCustomizableDebugScreen?: boolean;
}

export const debugState: DebugState = createDebugState();

export function createDebugState(): DebugState {
	let debugConsole = $state(false);
	let debugMode = $state(false);
	let debugToggleMenu = $state(false);
	let viewObjects = $state(new SvelteMap<string, any>());
	let viewObject = $state<object>();
	let debugDialogController = createDialogController();
	let customizableDebugScreen = $state<Snippet>();
	let showCustomizableDebugScreen = $state<boolean>(false);

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
		},
		get debugDialogController() {
			return debugDialogController;
		},
		get customizableDebugScreen() {
			return customizableDebugScreen;
		},
		set customizableDebugScreen(s: Snippet | undefined) {
			customizableDebugScreen = s;
		},
		get showCustomizableDebugScreen() {
			return showCustomizableDebugScreen;
		},
		set showCustomizableDebugScreen(b: boolean) {
			showCustomizableDebugScreen = b;
		}
	};
}
