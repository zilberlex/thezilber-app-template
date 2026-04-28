import { DispatcherImpl } from '$lib/engine/patterns/observer';

export type NavigationMode = 'mouse' | 'keyboard';

class NavigationStateManager {
	#navigationModeInternal: NavigationMode = $state('mouse');

	get navigationMode() {
		return this.#navigationModeInternal;
	}

	set #navigationMode(navigationMode: NavigationMode) {
		console.log('reached setNavigationMode2', navigationMode, this.#navigationModeInternal);

		if (navigationMode != this.#navigationModeInternal) {
			console.log('reached setMouseNavigationMode3');

			console.debug('StateManager Mode Change. Setting New mode:', navigationMode);

			this.#navigationModeInternal = navigationMode;
		}
	}

	setMouseNavigationMode() {
		if (this.navigationMode !== 'mouse') {
			console.log('NavigationStateManager - setNavigationMode [Mouse]');

			this.#navigationMode = 'mouse';
		}
	}

	setKeyboardNavigationMode() {
		if (this.navigationMode !== 'keyboard') {
			console.log('NavigationStateManager - setNavigationMode [Keyboard]');
			this.#navigationMode = 'keyboard';
		}
	}
}

export const navigationStateManager = new NavigationStateManager();
