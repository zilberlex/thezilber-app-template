import { createSmartHandler } from '$lib/engine/events/event-handling';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import type {
	NavigationKeysConfig,
	NextNodeInfo,
	ScopeInfra,
	NodeFocusEvent,
	ScopeEscapeMode,
	NavigationTarget
} from './types';
import { getFocusableElementsByNode } from './navigation-utils';

const NAVIGATION_ID_ATTRIBUTE = 'data-navigation-id';

export default class NavigationScopeInfraImpl implements ScopeInfra {
	scopeName: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;
	navigationTargets: NavigationTarget[] = [];

	#focusNodeDispatcher = new DispatcherImpl<NodeFocusEvent>();

	#abortController: AbortController;

	#currentNavigationTargetIndex?: number = undefined;
	#currentNavigationTarget: NavigationTarget | undefined;
	#escapeMode: ScopeEscapeMode;
	#mutationObserver = new MutationObserver(() => {
		this.refreshNavigatableNodes();
	});

	constructor(
		scopeContainer: HTMLElement,
		navigationKeys: NavigationKeysConfig,
		scopeName: string,
		escapeMode: ScopeEscapeMode = 'circular'
	) {
		this.scopeName = scopeName;
		this.scopeContainer = scopeContainer;
		this.navigationKeys = navigationKeys;

		this.#escapeMode = escapeMode;

		this.#abortController = new AbortController();
	}

	get escapeMode(): ScopeEscapeMode {
		return this.#escapeMode;
	}

	init() {
		const { signal } = this.#abortController;

		this.refreshNavigatableNodes();

		this.scopeContainer.addEventListener(
			'focusin',
			createSmartHandler(this.#onFocusElement_SetCurrentNode, {
				debounceDelay: 50,
				cooldownDelay: 20
			}),
			{
				signal
			}
		);
	}

	getNextNodeInfo(key: string): NextNodeInfo {
		if (document.activeElement !== this.#currentNavigationTarget?.navigatableNode)
			return { nextNode: this.#currentNavigationTarget };

		const navKeys = this.navigationKeys;

		let nextNodeIndex = null;

		if (navKeys.nextKeys.includes(key)) {
			nextNodeIndex = this.#currentNavigationTargetIndex !== undefined ? this.#currentNavigationTargetIndex + 1 : 0;
		} else if (navKeys.prevKeys.includes(key)) {
			nextNodeIndex =
				this.#currentNavigationTargetIndex !== undefined
					? this.#currentNavigationTargetIndex - 1
					: this.navigationTargets.length - 1;
		}

		let ret: NextNodeInfo = {};

		if (nextNodeIndex == null) {
			return {};
		}

		if (nextNodeIndex >= 0 && nextNodeIndex < this.navigationTargets.length) {
			ret.nextNode = this.navigationTargets[nextNodeIndex];
		} else {
			nextNodeIndex = nextNodeIndex < 0 ? this.navigationTargets.length - 1 : 0;

			let nextNodeCircular = this.navigationTargets[nextNodeIndex];

			if (this.escapeMode === 'escape') {
				ret.escapeBackupNode = nextNodeCircular;
			} else {
				ret.nextNode = nextNodeCircular;
			}
		}

		return ret;
	}

	refreshNavigatableNodes() {
		const prevNavigationTarget = this.#currentNavigationTarget;
		const previousIndex = this.#currentNavigationTargetIndex ?? 0;

		this.navigationTargets = getFocusableElementsByNode(this.scopeContainer).map((x) =>
			this.#createNavigationTarget(x)
		);
		this.#initializeFocusableElements(this.navigationTargets);

		console.debug(
			'Navigation Scope - Refreshing Navigatable Nodes',
			this.scopeContainer,
			'nodes found:',
			this.navigationTargets
		);

		if (
			prevNavigationTarget &&
			prevNavigationTarget.navigatableNode &&
			this.scopeContainer.contains(prevNavigationTarget.navigatableNode)
		) {
			this.#setCurrentNavigationTarget(prevNavigationTarget);
			return;
		}

		this.#setCurrentByFallbackIndex(previousIndex);
	}

	registerOnFocus(handler: (dispatchedObject: NodeFocusEvent) => void): { unregister: () => void } {
		this.#focusNodeDispatcher.register(handler);

		return {
			unregister: () => this.#focusNodeDispatcher.unregister(handler)
		};
	}

	get currentNavigationTarget(): NavigationTarget | undefined {
		const target = this.#currentNavigationTarget ?? this.navigationTargets[0];

		return target;
	}

	observeMutations(element: HTMLElement, options: MutationObserverInit = { childList: true }) {
		this.#mutationObserver.observe(element, options);
	}

	destroy() {
		this.#abortController.abort();
		this.#mutationObserver.disconnect();
	}

	#initializeFocusableElements(focusableElements: NavigationTarget[]) {
		const currentActiveElement = document.activeElement;

		for (let i = 0; i < focusableElements.length; i++) {
			const navigationTarget = focusableElements[i];

			const navigatableNode = navigationTarget.navigatableNode;

			if (navigatableNode) {
				navigationTarget.navigatableNode.setAttribute(NAVIGATION_ID_ATTRIBUTE, i.toString());

				if (navigationTarget.navigatableNode === currentActiveElement) {
					this.#setCurrentNavigationTarget(navigationTarget);
				}
			}
		}
	}

	#resolveNavigationTargetElement(target: HTMLElement): HTMLElement | undefined {
		return target;
	}

	#setCurrentNavigationTarget(navigationTarget: NavigationTarget) {
		const index = this.#getNavigationIndexFromNavigationTarget(navigationTarget);

		if (index === undefined) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: node missing/invalid navigation id.', navigationTarget);
			return;
		}

		this.#currentNavigationTarget = navigationTarget;
		this.#currentNavigationTargetIndex = index;

		this.#focusNodeDispatcher.signal({ targetNode: navigationTarget.navigatableNode as HTMLElement });
	}

	#setCurrentByFallbackIndex(index: number) {
		const length = this.navigationTargets.length;

		if (length === 0) {
			this.#currentNavigationTarget = undefined;
			this.#currentNavigationTargetIndex = undefined;
			return;
		}

		const fallbackIndex = Math.min(index, length - 1);

		this.#currentNavigationTargetIndex = fallbackIndex;
		this.#currentNavigationTarget = this.navigationTargets[fallbackIndex];
	}

	#getNavigatableNodeFromEvent(event: Event): NavigationTarget | undefined {
		const target = event.target;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const node = target.closest(`[${NAVIGATION_ID_ATTRIBUTE}]`);

		if (!(node instanceof HTMLElement)) {
			return;
		}

		if (!this.scopeContainer.contains(node)) {
			return;
		}

		return this.#createNavigationTarget(node);
	}

	#getNavigationIndexFromNavigationTarget(navigationTarget: NavigationTarget): number | undefined {
		const navId = navigationTarget.navigatableNode?.getAttribute(NAVIGATION_ID_ATTRIBUTE);

		if (navId === null || navId === undefined) {
			return;
		}

		const parsedIndex = Number.parseInt(navId, 10);

		if (Number.isNaN(parsedIndex)) {
			return;
		}

		return parsedIndex;
	}

	#createNavigationTarget(targetElement: HTMLElement): NavigationTarget {
		const thisScope = this;
		return {
			targetElement,
			get navigatableNode() {
				return thisScope.#resolveNavigationTargetElement(targetElement);
			}
		};
	}

	#onFocusElement_SetCurrentNode = (event: FocusEvent | PointerEvent) => {
		const navigationTarget = this.#getNavigatableNodeFromEvent(event);

		if (!navigationTarget) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: reached unnavigatable node, skipping.');
			return;
		}

		const nodeIndex = this.#getNavigationIndexFromNavigationTarget(navigationTarget);

		if (nodeIndex === undefined) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: node missing navigation id.', navigationTarget);
			return;
		}

		console.debug('ARROW SCOPE FOCUS_CHANGE: Setting current node/index', {
			nodeIndex,
			node: navigationTarget
		});

		this.#setCurrentNavigationTarget(navigationTarget);
	};
}
