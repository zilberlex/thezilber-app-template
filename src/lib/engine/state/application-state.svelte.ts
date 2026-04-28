import { pageContext, type PageContext } from './page-context.svelte';
import { debugState, type DebugState } from './debug-state.svelte';
import { tooltipState, type TooltipState } from '../hotkey-tooltip/tooltip-state.svelte';
import { navigationStateManager, type NavigationMode } from './navigation-state.svelte';

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
	appRoot: HTMLElement | undefined;
	get navigationMode(): NavigationMode;
}

export const appState: AppState = createAppState();

function createAppState(): AppState {
	let isAppLoaded = $state(false);
	let isWindowFocused = $state(false);
	let userAgent = $state<string | undefined>(undefined);
	let userAgentType = $state<'desktop' | 'mobile' | undefined>(undefined);
	let currentFocusedNode = $state<Element | undefined>(undefined);
	let inJsEnabled = $state(false);
	let deviceId = $state<string | undefined>(undefined);
	let appRoot = $state<HTMLElement | undefined>(undefined);
	let navigationMode = $derived(navigationStateManager.navigationMode);

	return {
		get isAppLoaded() {
			return isAppLoaded;
		},
		set isAppLoaded(value: boolean) {
			isAppLoaded = value;
		},

		get isWindowFocused() {
			return isWindowFocused;
		},
		set isWindowFocused(value: boolean) {
			isWindowFocused = value;
		},

		get userAgent() {
			return userAgent;
		},
		set userAgent(value: string | undefined) {
			userAgent = value;
		},

		get userAgentType() {
			return userAgentType;
		},
		set userAgentType(value: 'desktop' | 'mobile' | undefined) {
			userAgentType = value;
		},

		get currentFocusedNode() {
			return currentFocusedNode;
		},
		set currentFocusedNode(value: Element | undefined) {
			currentFocusedNode = value;
		},

		get inJsEnabled() {
			return inJsEnabled;
		},
		set inJsEnabled(value: boolean) {
			inJsEnabled = value;
		},

		get tooltipState() {
			return tooltipState;
		},

		get pageContext() {
			return pageContext;
		},

		get deviceId() {
			return deviceId;
		},
		set deviceId(value: string | undefined) {
			deviceId = value;
		},

		get debug() {
			return debugState;
		},

		get appRoot() {
			return appRoot;
		},
		set appRoot(value: HTMLElement | undefined) {
			appRoot = value;
		},
		get navigationMode() {
			return navigationMode;
		}
	};
}
