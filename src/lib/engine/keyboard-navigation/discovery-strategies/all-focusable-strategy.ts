import { getFocusableElementsByNode, isFocusableElement } from '../navigation-utils';
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
		return mutations.some((mutation) => {
			if (mutation.type === 'attributes') {
				return true;
			}

			return mutationNodesAffectAllFocusableDiscovery(mutation);
		});
	}
};

function mutationNodesAffectAllFocusableDiscovery(mutation: MutationRecord): boolean {
	return [...mutation.addedNodes, ...mutation.removedNodes].some(nodeAffectsAutoDiscovery);
}

function nodeAffectsAutoDiscovery(node: Node): boolean {
	if (!(node instanceof HTMLElement)) return false;

	if (isFocusableElement(node)) return true;
	if (getFocusableElementsByNode(node).length > 0) return true;

	// Adding/removing a summary can change which summary is :first-of-type.
	return node.matches('summary') || node.querySelector('summary') !== null;
}
