import { getFocusableElementsByNode } from '../navigation-utils';
import type { NavigationDiscoveryStrategy } from './navigation-discovery-strategy';

export const allFocusableDiscoveryStrategy: NavigationDiscoveryStrategy = {
	mode: 'all-focusable',

	observerOptions: {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['href', 'disabled', 'tabindex', 'contenteditable', 'inert']
	},

	discover(rootElement) {
		return getFocusableElementsByNode(rootElement);
	},

	isInvalidatedBy(mutations) {
		return mutations.some((mutation) => mutation.type === 'childList' || mutation.type === 'attributes');
	}
};
