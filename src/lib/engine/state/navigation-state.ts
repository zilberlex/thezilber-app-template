import { DispatcherImpl } from '$lib/engine/patterns/observer';

export enum NavigationMode {
	Mouse,
	Keyboard
}

export type NavigationModeHandler = (navigationModeChange: NavigationMode) => void;

class NavigationStateManager {
	#navigationModeInternal = NavigationMode.Mouse;

	get navigationMode() {
		return this.#navigationModeInternal;
	}

	set #navigationMode(navigationMode: NavigationMode) {
		console.log('reached setNavigationMode2', navigationMode, this.#navigationModeInternal);

		if (navigationMode != this.#navigationModeInternal) {
			console.log('reached setMouseNavigationMode3');

			console.debug('StateManager Mode Change. Setting New mode:', navigationMode);

			this.#navigationModeInternal = navigationMode;
			this.#dispatcher.signal(navigationMode);
		}
	}

	#dispatcher = new DispatcherImpl<NavigationMode>();

	setMouseNavigationMode() {
		console.log('setNavigationMode1 Mouse');

		this.#navigationMode = NavigationMode.Mouse;
	}

	setKeyboardNavigationMode() {
		console.log('setNavigationMode1 Keyboard');

		this.#navigationMode = NavigationMode.Keyboard;
	}

	registerNavigationModeChange(handler: NavigationModeHandler) {
		this.#dispatcher.register(handler);
	}

	unregisterNavigationModeChange(handler: NavigationModeHandler): boolean {
		return this.#dispatcher.unregister(handler);
	}
}

export const navigationStateManager = new NavigationStateManager();
