import type { NavigationDiscoveryStrategy } from './discovery-strategies/navigation-discovery-strategy';
import type { NavigationRefreshConfig } from './types';

export class NavigationRefreshController {
	readonly mode: NavigationRefreshConfig['mode'];

	#scopeContainer: HTMLElement;
	#discoveryStrategy: NavigationDiscoveryStrategy;
	#refresh: () => void;

	#mutationObserver?: MutationObserver;

	constructor(
		scopeContainer: HTMLElement,
		refreshConfig: NavigationRefreshConfig,
		discoveryStrategy: NavigationDiscoveryStrategy,
		refresh: () => void
	) {
		this.mode = refreshConfig.mode;

		this.#scopeContainer = scopeContainer;
		this.#discoveryStrategy = discoveryStrategy;
		this.#refresh = refresh;
	}

	init() {
		if (this.mode === 'manual') {
			return;
		}

		this.#mutationObserver = new MutationObserver((mutations) => {
			if (this.#discoveryStrategy.isInvalidatedBy(mutations)) {
				this.#refresh();
			}
		});

		this.#mutationObserver.observe(this.#scopeContainer, this.#discoveryStrategy.observerOptions);
	}

	destroy() {
		this.#mutationObserver?.disconnect();
	}
}
