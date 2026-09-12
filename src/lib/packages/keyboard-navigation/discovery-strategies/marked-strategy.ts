import { NAVIGATION_TARGET_ATTRIBUTE } from '../consts';
import type { NavigationDiscoveryStrategy } from './navigation-discovery-strategy';

const markedTargetSelector = `[${NAVIGATION_TARGET_ATTRIBUTE}]`;
export const markedDiscoveryStrategy: NavigationDiscoveryStrategy = {
	mode: 'marked',

	observerOptions: {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: [NAVIGATION_TARGET_ATTRIBUTE]
	},

	discover(rootElement) {
		return Array.from(rootElement.querySelectorAll<HTMLElement>(markedTargetSelector));
	},

	isInvalidatedBy(mutations) {
		return mutations.some((mutation) => {
			if (mutation.type === 'attributes') {
				return true;
			}

			return mutationNodesAffectMarkedDiscovery(mutation);
		});
	}
};

function mutationNodesAffectMarkedDiscovery(mutation: MutationRecord): boolean {
	return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
		if (!(node instanceof HTMLElement)) return false;

		return node.matches(markedTargetSelector) || node.querySelector(markedTargetSelector) !== null;
	});
}
