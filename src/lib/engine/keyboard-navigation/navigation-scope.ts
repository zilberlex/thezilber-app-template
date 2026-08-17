import { createSmartHandler } from '$lib/engine/events/event-handling';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import type {
	NavigationKeysConfig,
	NextNodeInfo,
	ScopeInfra,
	NodeFocusEvent,
	ScopeEscapeMode,
	NavigationTarget,
	NavigationTargetId
} from './types';
import { getFocusableElementsByNode } from './navigation-utils';

const NAVIGATION_INDEX_ATTRIBUTE = 'data-debug-navigation-index';

const NAVIGATION_TARGET_ID_ATTRIBUTE = 'data-navigation-target-id';

export default class NavigationScopeInfraImpl implements ScopeInfra {
	scopeName: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;
	navigationTargets: NavigationTarget[] = [];

	#focusNodeDispatcher = new DispatcherImpl<NodeFocusEvent>();

	#abortController: AbortController;

	#currentNavigationTargetId?: NavigationTargetId;
	#navigationTargetsById = new Map<NavigationTargetId, NavigationTarget>();
	#navigationTargetIndexById = new Map<NavigationTargetId, number>();

	#escapeMode: ScopeEscapeMode;
	#mutationObserver = new MutationObserver(() => {
		this.refreshNavigatableNodes();
	});

	#automaticTargetIds = new WeakMap<HTMLElement, NavigationTargetId>();
	#targetIdCounter = 0;

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
		if (document.activeElement !== this.currentNavigationTarget?.navigatableNode)
			return { nextNode: this.currentNavigationTarget };

		const currentTarget = this.currentNavigationTarget;
		const currentTargetIndex = this.#navigationTargetIndexById.get(currentTarget.id);

		const navKeys = this.navigationKeys;

		let nextTargetIndex = null;

		if (navKeys.nextKeys.includes(key)) {
			nextTargetIndex = currentTargetIndex !== undefined ? currentTargetIndex + 1 : 0;
		} else if (navKeys.prevKeys.includes(key)) {
			nextTargetIndex = currentTargetIndex !== undefined ? currentTargetIndex - 1 : 0;
		}

		let ret: NextNodeInfo = {};

		if (nextTargetIndex == null) {
			return {};
		}

		if (nextTargetIndex >= 0 && nextTargetIndex < this.navigationTargets.length) {
			ret.nextNode = this.navigationTargets[nextTargetIndex];
		} else {
			nextTargetIndex = nextTargetIndex < 0 ? this.navigationTargets.length - 1 : 0;

			let nextNodeCircular = this.navigationTargets[nextTargetIndex];

			if (this.escapeMode === 'escape') {
				ret.escapeBackupNode = nextNodeCircular;
			} else {
				ret.nextNode = nextNodeCircular;
			}
		}

		return ret;
	}

	refreshNavigatableNodes() {
		const previousTargetId = this.#currentNavigationTargetId;

		const previousIndex =
			previousTargetId !== undefined ? (this.#navigationTargetIndexById.get(previousTargetId) ?? 0) : 0;

		if (previousIndex === undefined) {
			throw new Error(
				`NAVIGATION SCOPE REFRESH targetIndex not found ${previousTargetId ? this.#navigationTargetsById.get(previousTargetId)?.targetElement.toString() : 'NO_ID'}`
			);
		}

		const navigationTargets = getFocusableElementsByNode(this.scopeContainer).map((x) =>
			this.#createNavigationTarget(x)
		);

		this.#rebuildNavigationTargets(navigationTargets);
		this.#initializeFocusableElements(this.navigationTargets);

		console.debug(
			'Navigation Scope - Refreshing Navigation Targets',
			this.scopeContainer,
			'targets:',
			this.navigationTargets.map((target, index) => ({
				index,
				id: target.id,
				targetElement: target.targetElement,
				navigatableNode: target.navigatableNode
			}))
		);

		if (previousTargetId !== undefined && this.#navigationTargetsById.has(previousTargetId)) {
			this.#currentNavigationTargetId = previousTargetId;
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
		if (this.#currentNavigationTargetId !== undefined) {
			return this.#navigationTargetsById.get(this.#currentNavigationTargetId);
		}

		return this.navigationTargets[0];
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
				navigationTarget.navigatableNode.setAttribute(NAVIGATION_INDEX_ATTRIBUTE, i.toString());

				navigationTarget.targetElement.setAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE, navigationTarget.id);

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
		const index = this.#navigationTargetIndexById.get(navigationTarget.id);

		if (index === undefined) {
			console.warn('Navigation target is not registered in this scope.', navigationTarget);
			return;
		}

		this.#currentNavigationTargetId = navigationTarget.id;
	}

	#signalNavigationEvent() {
		const navigatableNode = this.currentNavigationTarget?.navigatableNode;
		if (navigatableNode) {
			this.#focusNodeDispatcher.signal({
				targetNode: navigatableNode
			});
		}
	}

	#setCurrentByFallbackIndex(index: number) {
		const length = this.navigationTargets.length;

		if (length === 0) {
			this.#currentNavigationTargetId = undefined;
			return;
		}

		const fallbackIndex = Math.min(index, length - 1);
		const fallbackTarget = this.navigationTargets[fallbackIndex];

		this.#currentNavigationTargetId = fallbackTarget.id;
	}

	#getNavigationTargetFromEvent(event: Event): NavigationTarget | undefined {
		const element = event.target;

		if (!(element instanceof HTMLElement)) {
			return;
		}

		const targetElement = element.closest(`[${NAVIGATION_TARGET_ID_ATTRIBUTE}]`);

		if (!(targetElement instanceof HTMLElement)) {
			return;
		}

		if (!this.scopeContainer.contains(targetElement)) {
			return;
		}

		const targetId = targetElement.getAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE);

		if (!targetId) {
			return;
		}

		return this.#navigationTargetsById.get(targetId);
	}

	#createNavigationTarget(targetElement: HTMLElement): NavigationTarget {
		const thisScope = this;
		const id = this.#getAutomaticNavigationTargetId(targetElement);

		return {
			id,
			targetElement,

			get navigatableNode() {
				return thisScope.#resolveNavigationTargetElement(targetElement);
			}
		};
	}

	#rebuildNavigationTargets(navigationTargets: NavigationTarget[]) {
		this.#navigationTargetsById.clear();
		this.#navigationTargetIndexById.clear();

		this.navigationTargets = navigationTargets;

		for (let index = 0; index < navigationTargets.length; index++) {
			const target = navigationTargets[index];

			if (this.#navigationTargetsById.has(target.id)) {
				throw new Error(`Duplicate navigation target id: ${target.id}`);
			}

			this.#navigationTargetsById.set(target.id, target);
			this.#navigationTargetIndexById.set(target.id, index);
		}
	}

	#onFocusElement_SetCurrentNode = (event: FocusEvent | PointerEvent) => {
		const navigationTarget = this.#getNavigationTargetFromEvent(event);

		if (!navigationTarget) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: reached unnavigatable node, skipping.');
			return;
		}

		this.#setCurrentNavigationTarget(navigationTarget);
		this.#signalNavigationEvent();
	};

	#getAutomaticNavigationTargetId(element: HTMLElement): NavigationTargetId {
		const existing = this.#automaticTargetIds.get(element);

		if (existing) {
			return existing;
		}

		const id = `auto-${this.#targetIdCounter++}`;
		this.#automaticTargetIds.set(element, id);

		return id;
	}
}
