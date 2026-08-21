import { createSmartHandler } from '$lib/engine/events/event-handling';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import {
	type NavigationKeysConfig,
	type NextNodeInfo,
	type ScopeInfra,
	type ScopeFocusEvent,
	type ScopeEscapeMode,
	type KeyboardNavigationTarget,
	type NavigationTargetId,
	type ResolvedKeyboardNavigationTarget,
	type NavigationDiscoveryMode
} from './types';
import { getFocusableElementsByNode, keyBoardFocusNavigatedNode } from './navigation-utils';
import { keyboardNavigationTarget } from './navigation-target';
import { NAVIGATION_SCOPE_ATTRIBUTE, NAVIGATION_TARGET_ATTRIBUTE } from './consts';
import { engineAssert } from '../error/engine-assert';

const NAVIGATION_INDEX_ATTRIBUTE = 'data-debug-navigation-index';
const NAVIGATION_TARGET_ID_ATTRIBUTE = 'data-navigation-target-id';

export default class NavigationScopeInfraImpl implements ScopeInfra {
	scopeId: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;
	navigationTargets: KeyboardNavigationTarget[] = [];

	#focusTargetDispatcher = new DispatcherImpl<ScopeFocusEvent>();

	#abortController: AbortController;

	#currentNavigationTargetId?: NavigationTargetId;
	#navigationTargetsById = new Map<NavigationTargetId, KeyboardNavigationTarget>();
	#navigationTargetIndexById = new Map<NavigationTargetId, number>();

	#escapeMode: ScopeEscapeMode;
	#mutationObserver = new MutationObserver(() => {
		this.refreshNavigationTargets();
	});

	#automaticTargetIds = new WeakMap<HTMLElement, NavigationTargetId>();
	#targetIdCounter = 0;
	#discoveryMode: NavigationDiscoveryMode;

	constructor(
		scopeElement: HTMLElement,
		navigationKeys: NavigationKeysConfig,
		scopeId: string,
		discoveryMode: NavigationDiscoveryMode = 'auto',
		escapeMode: ScopeEscapeMode = 'circular'
	) {
		NavigationScopeInfraImpl.#assertNotNestedScope(scopeElement);

		scopeElement.setAttribute(NAVIGATION_SCOPE_ATTRIBUTE, '');

		this.scopeId = scopeId;
		this.scopeContainer = scopeElement;
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

		this.refreshNavigationTargets();

		this.scopeContainer.addEventListener(
			'focusin',
			createSmartHandler(this.#onFocusElement_SetCurrentTarget, {
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

		if (currentTarget && document.activeElement !== currentTarget.navigatableNode) {
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

		const nextTarget = this.#findResolvedTarget(startIndex, direction);

		if (nextTarget) {
			return { nextNode: nextTarget };
		}

		const wrappedStart = direction === 'forward' ? 0 : this.navigationTargets.length - 1;

		const wrappedTarget = this.#findResolvedTarget(wrappedStart, direction);

		if (!wrappedTarget) {
			return {};
		}

		if (this.escapeMode === 'escape') {
			return { escapeBackupNode: wrappedTarget };
		}

		return { nextNode: wrappedTarget };
	}

	refreshNavigationTargets() {
		const previousTargetId = this.#currentNavigationTargetId;

		const previousIndex =
			previousTargetId !== undefined ? (this.#navigationTargetIndexById.get(previousTargetId) ?? 0) : 0;

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

	registerOnFocus(handler: (dispatchedObject: ScopeFocusEvent) => void): { unregister: () => void } {
		this.#focusTargetDispatcher.register(handler);

		return {
			unregister: () => this.#focusTargetDispatcher.unregister(handler)
		};
	}

	get currentNavigationTarget(): ResolvedKeyboardNavigationTarget | undefined {
		return this.#resolveCurrentNavigationTarget();
	}

	focusCurrent() {
		const target = this.currentNavigationTarget;

		if (!target) {
			console.warn('NavigationScope FocusCurrent could not resolve a navigation target.');
			return;
		}

		keyBoardFocusNavigatedNode(target.navigatableNode);
	}

	focusFirst() {
		const target = this.#findResolvedTarget(0, 'forward');

		if (target) {
			keyBoardFocusNavigatedNode(target.navigatableNode);
		}
	}

	focusLast() {
		const target = this.#findResolvedTarget(this.navigationTargets.length - 1, 'backward');

		if (target) {
			keyBoardFocusNavigatedNode(target.navigatableNode);
		}
	}

	observeMutations(element: HTMLElement, options: MutationObserverInit = { childList: true }) {
		this.#mutationObserver.observe(element, options);
	}

	destroy() {
		this.#abortController.abort();
		this.#mutationObserver.disconnect();
		this.scopeContainer.removeAttribute(NAVIGATION_SCOPE_ATTRIBUTE);
	}

	static #assertNotNestedScope(scopeElement: HTMLElement): void {
		const isSelfAlreadyInitialized = scopeElement.hasAttribute(NAVIGATION_SCOPE_ATTRIBUTE);

		const foundParentScope = scopeElement.parentElement?.closest(`[${NAVIGATION_SCOPE_ATTRIBUTE}]`);

		const foundChildScope = scopeElement.querySelector(`[${NAVIGATION_SCOPE_ATTRIBUTE}]`);

		engineAssert(
			!isSelfAlreadyInitialized && !foundParentScope && !foundChildScope,
			'NavigationScope cannot overlap another NavigationScope or be initialized twice.',
			{
				scopeElement,
				isSelfAlreadyInitialized,
				foundParentScope,
				foundChildScope
			}
		);
	}

	#findResolvedTarget(
		startIndex: number,
		direction: 'forward' | 'backward'
	): ResolvedKeyboardNavigationTarget | undefined {
		const step = direction === 'forward' ? 1 : -1;

		for (let index = startIndex; index >= 0 && index < this.navigationTargets.length; index += step) {
			const resolvedTarget = this.#resolveTarget(this.navigationTargets[index]);

			if (resolvedTarget) {
				return resolvedTarget;
			}
		}
	}

	#resolveTarget(target: KeyboardNavigationTarget | undefined): ResolvedKeyboardNavigationTarget | undefined {
		if (!target) return;

		const navigatableNode = target.navigatableNode;

		if (!navigatableNode) return;

		return {
			id: target.id,
			targetElement: target.targetElement,
			navigatableNode
		};
	}

	#discoverNavigationTargetElements(discoveryMode: NavigationDiscoveryMode, rootElement: HTMLElement): HTMLElement[] {
		if (discoveryMode === 'marked') {
			return Array.from(rootElement.querySelectorAll<HTMLElement>(`[${NAVIGATION_TARGET_ATTRIBUTE}]`));
		}

		return getFocusableElementsByNode(rootElement);
	}

	#resolveCurrentNavigationTarget(): ResolvedKeyboardNavigationTarget | undefined {
		const currentTargetId = this.#currentNavigationTargetId;

		if (currentTargetId === undefined) {
			return this.#findResolvedTarget(0, 'forward');
		}

		const currentIndex = this.#navigationTargetIndexById.get(currentTargetId);

		if (currentIndex === undefined) {
			console.warn('No Navigation Target Index On Scope', {
				scopeId: this.scopeId,
				currentNavigationTargetId: currentTargetId
			});

			return;
		}

		return this.#findClosestResolvedTarget(currentIndex);
	}

	#findClosestResolvedTarget(startIndex: number): ResolvedKeyboardNavigationTarget | undefined {
		const length = this.navigationTargets.length;

		for (let distance = 0; distance < length; distance++) {
			const forwardIndex = startIndex + distance;

			if (forwardIndex < length) {
				const resolvedTarget = this.#resolveTarget(this.navigationTargets[forwardIndex]);

				if (resolvedTarget) {
					return resolvedTarget;
				}
			}

			const backwardIndex = startIndex - distance;

			if (distance > 0 && backwardIndex >= 0) {
				const resolvedTarget = this.#resolveTarget(this.navigationTargets[backwardIndex]);

				if (resolvedTarget) {
					return resolvedTarget;
				}
			}
		}
	}

	#initializeNavigationTargets(navigationTargets: KeyboardNavigationTarget[]) {
		const currentActiveElement = document.activeElement;

		for (let i = 0; i < navigationTargets.length; i++) {
			const navigationTarget = navigationTargets[i];

			const navigatableNode = navigationTarget.navigatableNode;

			const navigationTargetNode = navigationTarget.targetElement;

			navigationTargetNode.setAttribute(NAVIGATION_INDEX_ATTRIBUTE, i.toString());
			navigationTargetNode.setAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE, navigationTarget.id);

			if (navigatableNode === currentActiveElement) {
				this.#setCurrentNavigationTarget(navigationTarget);
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
		this.#focusTargetDispatcher.signal({
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

	#onFocusElement_SetCurrentTarget = (event: FocusEvent | PointerEvent) => {
		const navigationTarget = this.#getNavigationTargetFromEvent(event);

		if (!navigationTarget) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: reached unnavigatable node, skipping.', {
				scopeId: this.scopeId,
				event
			});
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
