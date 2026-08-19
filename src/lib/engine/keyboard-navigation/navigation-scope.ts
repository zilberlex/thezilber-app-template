import { createSmartHandler } from '$lib/engine/events/event-handling';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import {
	type NavigationKeysConfig,
	type NextNodeInfo,
	type ScopeInfra,
	type ScopeFocusEvent,
	type ScopeEscapeMode,
	type KeyboardNavigationTarget,
	type NavigationTargetId
} from './types';
import { getFocusableElementsByNode, keyBoardFocusNavigatedNode } from './navigation-utils';
import { keyboardNavigationTarget } from './navigation-target';
import { NAVIGATION_TARGET_ATTRIBUTE } from './consts';

const NAVIGATION_INDEX_ATTRIBUTE = 'data-debug-navigation-index';
const NAVIGATION_TARGET_ID_ATTRIBUTE = 'data-navigation-target-id';

export type NavigationDiscoveryMode = 'marked' | 'auto';

export default class NavigationScopeInfraImpl implements ScopeInfra {
	scopeId: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;
	navigationTargets: KeyboardNavigationTarget[] = [];

	#focusNodeDispatcher = new DispatcherImpl<ScopeFocusEvent>();

	#abortController: AbortController;

	#currentNavigationTargetId?: NavigationTargetId;
	#navigationTargetsById = new Map<NavigationTargetId, KeyboardNavigationTarget>();
	#navigationTargetIndexById = new Map<NavigationTargetId, number>();

	#escapeMode: ScopeEscapeMode;
	#mutationObserver = new MutationObserver(() => {
		this.refreshNavigatableNodes();
	});

	#automaticTargetIds = new WeakMap<HTMLElement, NavigationTargetId>();
	#targetIdCounter = 0;
	#discoveryMode: NavigationDiscoveryMode;

	constructor(
		scopeContainer: HTMLElement,
		navigationKeys: NavigationKeysConfig,
		scopeId: string,
		discoveryMode: NavigationDiscoveryMode = 'auto',
		escapeMode: ScopeEscapeMode = 'circular'
	) {
		this.scopeId = scopeId;
		this.scopeContainer = scopeContainer;
		this.navigationKeys = navigationKeys;

		this.#escapeMode = escapeMode;

		this.#abortController = new AbortController();
		this.#discoveryMode = discoveryMode;
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
		const direction = this.navigationKeys.nextKeys.includes(key)
			? 'forward'
			: this.navigationKeys.prevKeys.includes(key)
				? 'backward'
				: undefined;

		if (!direction) return {};

		const currentTarget = this.currentNavigationTarget;
		const currentNode = currentTarget?.navigatableNode;

		if (currentTarget && currentNode && document.activeElement !== currentNode) {
			return { nextNode: currentTarget };
		}

		const currentIndex =
			currentTarget !== undefined ? this.#navigationTargetIndexById.get(currentTarget.id) : undefined;

		const step = direction === 'forward' ? 1 : -1;

		const startIndex =
			currentIndex !== undefined
				? currentIndex + step
				: direction === 'forward'
					? 0
					: this.navigationTargets.length - 1;

		const nextTarget = this.#findResolvedTarget(startIndex, direction, false);

		if (nextTarget) {
			return { nextNode: nextTarget };
		}

		const wrappedStart = direction === 'forward' ? 0 : this.navigationTargets.length - 1;

		const wrappedTarget = this.#findResolvedTarget(wrappedStart, direction, false);

		if (!wrappedTarget) {
			return {};
		}

		if (this.escapeMode === 'escape') {
			return { escapeBackupNode: wrappedTarget };
		}

		return { nextNode: wrappedTarget };
	}

	#findResolvedTarget(
		startIndex: number,
		direction: 'forward' | 'backward',
		wrap: boolean
	): KeyboardNavigationTarget | undefined {
		const length = this.navigationTargets.length;

		if (length === 0) return;

		const step = direction === 'forward' ? 1 : -1;
		let index = startIndex;

		for (let visited = 0; visited < length; visited++) {
			if (index < 0 || index >= length) {
				if (!wrap) return;

				index = index < 0 ? length - 1 : 0;
			}

			const target = this.navigationTargets[index];

			if (target.navigatableNode) {
				return target;
			}

			index += step;
		}

		return;
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

		const navigationTargets = this.#discoverNavigationTargetElements(this.#discoveryMode, this.scopeContainer).map(
			(e) => this.#createNavigationTarget(e)
		);
		this.#rebuildNavigationTargets(navigationTargets);
		this.#initializeNavigationTargets(this.navigationTargets);

		console.debug(
			'Navigation Scope - Refreshing Navigation Targets',
			this.scopeContainer,
			{ discoveryMody: this.#discoveryMode },
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

	#discoverNavigationTargetElements(discoveryMode: NavigationDiscoveryMode, rootElement: HTMLElement): HTMLElement[] {
		if (discoveryMode === 'marked') {
			return Array.from(rootElement.querySelectorAll<HTMLElement>(`[${NAVIGATION_TARGET_ATTRIBUTE}]`));
		}

		return getFocusableElementsByNode(rootElement);
	}

	registerOnFocus(handler: (dispatchedObject: ScopeFocusEvent) => void): { unregister: () => void } {
		this.#focusNodeDispatcher.register(handler);

		return {
			unregister: () => this.#focusNodeDispatcher.unregister(handler)
		};
	}

	get currentNavigationTarget(): KeyboardNavigationTarget | undefined {
		if (this.#currentNavigationTargetId !== undefined) {
			return this.#navigationTargetsById.get(this.#currentNavigationTargetId);
		}

		return this.#findResolvedTarget(0, 'forward', false);
	}

	focusCurrent() {
		const navigationTarget = this.currentNavigationTarget;
		const navigatableNode = navigationTarget?.navigatableNode;

		if (!navigatableNode) {
			console.warn(
				'NavigationScope FocusCurrent navigationTarget did not contain a node. Navigation target:',
				navigationTarget
			);
			return;
		}
		keyBoardFocusNavigatedNode(navigatableNode);
	}

	focusLast() {
		const navigationTarget = this.navigationTargets.at(-1);
		const navigatableNode = navigationTarget?.navigatableNode;

		if (!navigatableNode) {
			console.warn(
				'NavigationScope FocusLast navigationTarget did not contain a node. Navigation target:',
				navigationTarget
			);
			return;
		}
		keyBoardFocusNavigatedNode(navigatableNode);
	}

	focusFirst() {
		const navigationTarget = this.navigationTargets.at(0);
		const navigatableNode = navigationTarget?.navigatableNode;

		if (!navigatableNode) {
			console.warn(
				'NavigationScope FocusFirst navigationTarget did not contain a node. Navigation target:',
				navigationTarget
			);
			return;
		}
		keyBoardFocusNavigatedNode(navigatableNode);
	}

	observeMutations(element: HTMLElement, options: MutationObserverInit = { childList: true }) {
		this.#mutationObserver.observe(element, options);
	}

	destroy() {
		this.#abortController.abort();
		this.#mutationObserver.disconnect();
	}

	#initializeNavigationTargets(focusableElements: KeyboardNavigationTarget[]) {
		const currentActiveElement = document.activeElement;

		for (let i = 0; i < focusableElements.length; i++) {
			const navigationTarget = focusableElements[i];

			const navigatableNode = navigationTarget.navigatableNode;

			const navigationTargetNode = navigationTarget.targetElement;

			if (navigatableNode) {
				navigationTargetNode.setAttribute(NAVIGATION_INDEX_ATTRIBUTE, i.toString());

				navigationTargetNode.setAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE, navigationTarget.id);

				if (navigationTarget.navigatableNode === currentActiveElement) {
					this.#setCurrentNavigationTarget(navigationTarget);
				}
			}
		}
	}

	#setCurrentNavigationTarget(navigationTarget: KeyboardNavigationTarget) {
		const index = this.#navigationTargetIndexById.get(navigationTarget.id);

		if (index === undefined) {
			console.warn('Navigation target is not registered in this scope.', navigationTarget);
			return;
		}

		this.#currentNavigationTargetId = navigationTarget.id;
	}

	#signalNavigationEvent(navigationTarget: KeyboardNavigationTarget) {
		this.#focusNodeDispatcher.signal({
			navigationTarget
		});
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

	#getNavigationTargetFromEvent(event: Event): KeyboardNavigationTarget | undefined {
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

	#createNavigationTarget(targetElement: HTMLElement): KeyboardNavigationTarget {
		const id = this.#getAutomaticNavigationTargetId(targetElement);

		return keyboardNavigationTarget(id, targetElement);
	}

	#rebuildNavigationTargets(navigationTargets: KeyboardNavigationTarget[]) {
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
		this.#signalNavigationEvent(navigationTarget);
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
