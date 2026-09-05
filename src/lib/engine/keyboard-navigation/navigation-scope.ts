import { createSmartHandler } from '../../../packages/core/src/events/event-handling';
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
	type NavigationScopeOptions,
	type NavigationDiscoveryMode,
	type NavigationTargetRestorationPoint
} from './types';
import { keyBoardFocusNavigatedNode } from './navigation-utils';
import { keyboardNavigationTarget } from './navigation-target';
import {
	NAVIGATION_RESOLVED_TARGET_ID_ATTRIBUTE,
	NAVIGATION_SCOPE_ATTRIBUTE,
	NAVIGATION_TARGET_ATTRIBUTE,
	NAVIGATION_TARGET_ID_ATTRIBUTE
} from './consts';

import { engineAssert } from '../error/engine-assert';
import { NAVIGATION_SCOPE_DEFAULTS } from './configurations';

import {
	getNavigationDiscoveryStrategy,
	type NavigationDiscoveryStrategy
} from './discovery-strategies/navigation-discovery-strategy';
import { NavigationRefreshController } from './navigation-refresh-controller';
import { MapList } from '$lib/engine/patterns/lists-and-maps-advanced/map-list';

const NAVIGATION_INDEX_ATTRIBUTE = 'data-debug-navigation-index';

const AUTOMATIC_NAVIGATION_TARGET_ID_PREFIX = '__navigation-auto-';

let automaticNavigationTargetIdCounter = 0;

export default class NavigationScopeInfraImpl implements ScopeInfra {
	scopeId: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;

	#focusTargetDispatcher = new DispatcherImpl<ScopeFocusEvent>();

	#abortController: AbortController;

	#currentNavigationTargetData?: NavigationTargetRestorationPoint;

	#navigationTargets = new MapList<NavigationTargetId, KeyboardNavigationTarget>();

	#escapeMode: ScopeEscapeMode;
	#automaticTargetIds = new WeakMap<HTMLElement, NavigationTargetId>();

	#discoveryStrategy: NavigationDiscoveryStrategy;
	#refreshController: NavigationRefreshController;

	#refreshCount = 0;

	constructor(
		scopeContainer: HTMLElement,
		scopeId: string,
		{
			navigationKeys = NAVIGATION_SCOPE_DEFAULTS.navigationKeys,
			discoveryMode = NAVIGATION_SCOPE_DEFAULTS.discoveryMode,
			escapeMode = NAVIGATION_SCOPE_DEFAULTS.escapeMode,
			refreshOptions = NAVIGATION_SCOPE_DEFAULTS.refreshOptions
		}: NavigationScopeOptions = {}
	) {
		assertNotNestedScope(scopeContainer);

		scopeContainer.setAttribute(NAVIGATION_SCOPE_ATTRIBUTE, '');

		this.scopeId = scopeId;
		this.scopeContainer = scopeContainer;
		this.navigationKeys = navigationKeys;

		this.#escapeMode = escapeMode;

		this.#abortController = new AbortController();

		this.#discoveryStrategy = getNavigationDiscoveryStrategy(discoveryMode);
		this.#refreshController = new NavigationRefreshController(
			scopeContainer,
			refreshOptions,
			this.#discoveryStrategy,
			() => this.refreshNavigationTargets()
		);
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
				debounceDelay: 0,
				cooldownDelay: 0
			}),
			{ signal }
		);

		this.#refreshController.init();
	}

	destroy() {
		this.#abortController.abort();
		this.#refreshController.destroy();
		this.scopeContainer.removeAttribute(NAVIGATION_SCOPE_ATTRIBUTE);
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

		const currentIndex = currentTarget !== undefined ? this.#navigationTargets.indexOf(currentTarget.id) : -1;

		const step = direction === 'forward' ? 1 : -1;

		const startIndex =
			currentIndex !== -1 ? currentIndex + step : direction === 'forward' ? 0 : this.#navigationTargets.size - 1;

		const nextTarget = this.#findResolvedTarget(startIndex, direction);

		if (nextTarget) {
			return { nextNode: nextTarget };
		}

		const wrappedStart = direction === 'forward' ? 0 : this.#navigationTargets.size - 1;

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
		this.#refreshCount++;

		const navigationTargets = this.#discoveryStrategy
			.discover(this.scopeContainer)
			.map((element) => this.#createNavigationTarget(element));

		assertNotNestedNavigationTargets(navigationTargets, this.#discoveryStrategy.mode);

		this.#rebuildNavigationTargets(navigationTargets);

		const activeNavigationTarget = this.#initializeNavigationTargets(navigationTargets);

		if (activeNavigationTarget) {
			this.#setCurrentNavigationTarget(activeNavigationTarget);
			return;
		}

		const currentTargetData = this.#currentNavigationTargetData;

		if (!currentTargetData) {
			return;
		}

		const currentIndex = this.#navigationTargets.indexOf(currentTargetData.id);

		if (currentIndex !== -1) {
			this.#currentNavigationTargetData = {
				id: currentTargetData.id,
				index: currentIndex
			};
		}
	}
	registerOnFocus(handler: (dispatchedObject: ScopeFocusEvent) => void): () => void {
		this.#focusTargetDispatcher.register(handler);

		return () => {
			this.#focusTargetDispatcher.unregister(handler);
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
		const target = this.#findResolvedTarget(this.#navigationTargets.size - 1, 'backward');

		if (target) {
			keyBoardFocusNavigatedNode(target.navigatableNode);
		}
	}

	getNavigationTargetRestorationPoint(): NavigationTargetRestorationPoint | undefined {
		return this.#currentNavigationTargetData ? { ...this.#currentNavigationTargetData } : undefined;
	}

	restoreNavigationTarget(restorationPoint: NavigationTargetRestorationPoint): boolean {
		const { id, index } = restorationPoint;

		const targetById = this.#navigationTargets.get(id);

		if (targetById) {
			this.#setCurrentNavigationTarget(targetById);
			return true;
		}

		if (!Number.isInteger(index) || index < 0) {
			return false;
		}

		const targetByIndex = this.#navigationTargets.at(index);

		if (!targetByIndex) {
			return false;
		}

		this.#setCurrentNavigationTarget(targetByIndex);
		return true;
	}

	hasNavigationTargetForNode(node: Element | null): boolean {
		if (!node) {
			return false;
		}

		for (const target of this.#navigationTargets.values()) {
			if (target.navigatableNode === node) {
				return true;
			}
		}

		return false;
	}

	_debugInfo() {
		return {
			refreshCount: this.#refreshCount
		};
	}

	#findResolvedTarget(
		startIndex: number,
		direction: 'forward' | 'backward'
	): ResolvedKeyboardNavigationTarget | undefined {
		const step = direction === 'forward' ? 1 : -1;

		for (let index = startIndex; index >= 0 && index < this.#navigationTargets.size; index += step) {
			const resolvedTarget = this.#resolveTarget(this.#navigationTargets.at(index));

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

	#resolveCurrentNavigationTarget(): ResolvedKeyboardNavigationTarget | undefined {
		const currentTargetData = this.#currentNavigationTargetData;

		if (!currentTargetData) {
			return this.#findResolvedTarget(0, 'forward');
		}

		const currentIndex = this.#navigationTargets.indexOf(currentTargetData.id);

		if (currentIndex !== -1) {
			return this.#findClosestResolvedTarget(currentIndex);
		}

		if (this.#navigationTargets.size === 0) {
			return;
		}

		const fallbackIndex = Math.min(currentTargetData.index, this.#navigationTargets.size - 1);

		return this.#findClosestResolvedTarget(fallbackIndex);
	}

	#findClosestResolvedTarget(startIndex: number): ResolvedKeyboardNavigationTarget | undefined {
		const length = this.#navigationTargets.size;

		for (let distance = 0; distance < length; distance++) {
			const forwardIndex = startIndex + distance;

			if (forwardIndex < length) {
				const resolvedTarget = this.#resolveTarget(this.#navigationTargets.at(forwardIndex));

				if (resolvedTarget) {
					return resolvedTarget;
				}
			}

			const backwardIndex = startIndex - distance;

			if (distance > 0 && backwardIndex >= 0) {
				const resolvedTarget = this.#resolveTarget(this.#navigationTargets.at(backwardIndex));

				if (resolvedTarget) {
					return resolvedTarget;
				}
			}
		}
	}

	#initializeNavigationTargets(navigationTargets: KeyboardNavigationTarget[]): KeyboardNavigationTarget | undefined {
		const currentActiveElement = document.activeElement;
		let activeNavigationTarget: KeyboardNavigationTarget | undefined;

		for (let i = 0; i < navigationTargets.length; i++) {
			const navigationTarget = navigationTargets[i];

			const navigatableNode = navigationTarget.navigatableNode;
			const navigationTargetElement = navigationTarget.targetElement;

			if (!navigationTargetElement) {
				console.warn('Navigation Target Element Does not exist', {
					index: i
				});

				continue;
			}

			navigationTargetElement.setAttribute(NAVIGATION_INDEX_ATTRIBUTE, i.toString());
			navigationTargetElement.setAttribute(NAVIGATION_RESOLVED_TARGET_ID_ATTRIBUTE, navigationTarget.id);

			if (navigatableNode === currentActiveElement) {
				activeNavigationTarget = navigationTarget;
			}
		}

		return activeNavigationTarget;
	}

	#setCurrentNavigationTarget(navigationTarget: KeyboardNavigationTarget) {
		const index = this.#navigationTargets.indexOf(navigationTarget.id);

		if (index === -1) {
			console.warn('Navigation target is not registered in this scope.', navigationTarget);
			return;
		}

		this.#currentNavigationTargetData = {
			id: navigationTarget.id,
			index
		};
	}

	#signalNavigationEvent(navigationTarget: KeyboardNavigationTarget) {
		this.#focusTargetDispatcher.signal({
			navigationTarget
		});
	}

	#getNavigationTargetFromEvent(event: Event): KeyboardNavigationTarget | undefined {
		const element = event.target;

		if (!(element instanceof HTMLElement)) {
			return;
		}

		const targetElement = element.closest(`[${NAVIGATION_RESOLVED_TARGET_ID_ATTRIBUTE}]`);

		if (!(targetElement instanceof HTMLElement)) {
			return;
		}

		if (!this.scopeContainer.contains(targetElement)) {
			return;
		}

		const targetId = targetElement.getAttribute(NAVIGATION_RESOLVED_TARGET_ID_ATTRIBUTE);

		if (!targetId) {
			return;
		}

		return this.#navigationTargets.get(targetId);
	}

	#createNavigationTarget(targetElement: HTMLElement): KeyboardNavigationTarget {
		const explicitId = targetElement.getAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE);

		if (explicitId !== null) {
			engineAssert(
				!explicitId.startsWith(AUTOMATIC_NAVIGATION_TARGET_ID_PREFIX),
				`Navigation target ID cannot use reserved prefix: ${AUTOMATIC_NAVIGATION_TARGET_ID_PREFIX}`,
				{ targetElement, explicitId }
			);

			return keyboardNavigationTarget(explicitId, targetElement);
		}

		return keyboardNavigationTarget(this.#getAutomaticNavigationTargetId(targetElement), targetElement);
	}

	#rebuildNavigationTargets(navigationTargets: KeyboardNavigationTarget[]) {
		this.#navigationTargets.clear();

		for (const target of navigationTargets) {
			engineAssert(!this.#navigationTargets.has(target.id), `Duplicate navigation target id: ${target.id}`);

			this.#navigationTargets.push(target.id, target);
		}
	}

	#onFocusElement_SetCurrentTarget = (event: FocusEvent) => {
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

		const id = `${AUTOMATIC_NAVIGATION_TARGET_ID_PREFIX}${automaticNavigationTargetIdCounter++}`;

		this.#automaticTargetIds.set(element, id);

		return id;
	}
}

function assertNotNestedScope(scopeElement: HTMLElement): void {
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

function assertNotNestedNavigationTargets(
	navigationTargets: KeyboardNavigationTarget[],
	discoveryMode: NavigationDiscoveryMode
): void {
	if (discoveryMode === 'marked') {
		for (const navigationTarget of navigationTargets) {
			const targetElement = navigationTarget.targetElement;
			const parentTarget = targetElement?.parentElement?.closest(`[${NAVIGATION_TARGET_ATTRIBUTE}]`);

			engineAssert(!parentTarget, 'NavigationTarget cannot be nested inside another NavigationTarget.', {
				targetElement,
				parentTarget
			});
		}
	}
}
