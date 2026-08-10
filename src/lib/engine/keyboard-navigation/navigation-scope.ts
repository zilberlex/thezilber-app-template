import { createSmartHandler } from '$lib/engine/events/event-handling';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import type {
	NavigationKeysConfig,
	NextNodeInfo,
	ScopeInfra as NavigationScopeInfra,
	NodeFocusEvent,
	ScopeEscapeMode
} from './types';
import { getFocusableElementsByNode } from './navigation-utils';

const NAVIGATION_ID_ATTRIBUTE = 'data-navigation-id';

export default class NavigationScopeInfraImpl implements NavigationScopeInfra {
	scopeName: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;
	navigatiableNodes: HTMLElement[] = [];

	#focusNodeDispatcher = new DispatcherImpl<NodeFocusEvent>();

	#abortController: AbortController;

	#currentNodeIndex?: number = undefined;
	#currentNode: HTMLElement | undefined;
	#escapeMode: ScopeEscapeMode;

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

	destroy() {
		this.#abortController.abort();
	}

	getNextNodeInfo(key: string): NextNodeInfo {
		if (document.activeElement !== this.#currentNode) return { nextNode: this.#currentNode };

		const navKeys = this.navigationKeys;

		let nextNodeIndex = null;

		if (navKeys.nextKeys.includes(key)) {
			nextNodeIndex = this.#currentNodeIndex !== undefined ? this.#currentNodeIndex + 1 : 0;
		} else if (navKeys.prevKeys.includes(key)) {
			nextNodeIndex =
				this.#currentNodeIndex !== undefined ? this.#currentNodeIndex - 1 : this.navigatiableNodes.length - 1;
		}

		let ret: NextNodeInfo = {};

		if (nextNodeIndex == null) {
			return {};
		}

		if (nextNodeIndex >= 0 && nextNodeIndex < this.navigatiableNodes.length) {
			ret.nextNode = this.navigatiableNodes[nextNodeIndex];
		} else {
			nextNodeIndex = nextNodeIndex < 0 ? this.navigatiableNodes.length - 1 : 0;

			let nextNodeCircular = this.navigatiableNodes[nextNodeIndex];

			if (this.escapeMode === 'escape') {
				ret.escapeBackupNode = nextNodeCircular;
			} else {
				ret.nextNode = nextNodeCircular;
			}
		}

		return ret;
	}

	refreshNavigatableNodes() {
		const previousNode = this.#currentNode;
		const previousIndex = this.#currentNodeIndex ?? 0;

		this.navigatiableNodes = getFocusableElementsByNode(this.scopeContainer);
		this.#initializeFocusableElements(this.navigatiableNodes);

		console.debug(
			'Navigation Scope - Refreshing Navigatable Nodes',
			this.scopeContainer,
			'nodes found:',
			this.navigatiableNodes
		);

		if (previousNode && this.scopeContainer.contains(previousNode)) {
			this.#setCurrentNode(previousNode);
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

	get currentNode() {
		if (this.#currentNode) {
			return this.#currentNode;
		}

		return this.navigatiableNodes[0];
	}

	#initializeFocusableElements(focusableElements: HTMLElement[]) {
		const currentActiveElement = document.activeElement;
		for (let i = 0; i < focusableElements.length; i++) {
			const node = focusableElements[i];

			node.setAttribute(NAVIGATION_ID_ATTRIBUTE, i.toString());

			if (node === currentActiveElement) {
				this.#setCurrentNode(node);
			}
		}
	}

	#setCurrentNode(node: HTMLElement) {
		const index = this.#getNavigationIndexFromNode(node);

		if (index === undefined) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: node missing/invalid navigation id.', node);
			return;
		}

		this.#currentNode = node;
		this.#currentNodeIndex = index;

		this.#focusNodeDispatcher.signal({ targetNode: node });
	}

	#setCurrentByFallbackIndex(index: number) {
		const length = this.navigatiableNodes.length;

		if (length === 0) {
			this.#currentNode = undefined;
			this.#currentNodeIndex = undefined;
			return;
		}

		const fallbackIndex = Math.min(index, length - 1);

		this.#currentNodeIndex = fallbackIndex;
		this.#currentNode = this.navigatiableNodes[fallbackIndex];
	}

	#getNavigatableNodeFromEvent(event: Event): HTMLElement | undefined {
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

		return node;
	}

	#getNavigationIndexFromNode(node: HTMLElement): number | undefined {
		const navId = node.getAttribute(NAVIGATION_ID_ATTRIBUTE);

		if (navId === null) {
			return;
		}

		const parsedIndex = Number.parseInt(navId, 10);

		if (Number.isNaN(parsedIndex)) {
			return;
		}

		return parsedIndex;
	}

	#onFocusElement_SetCurrentNode = (event: FocusEvent | PointerEvent) => {
		const node = this.#getNavigatableNodeFromEvent(event);

		if (!node) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: reached unnavigatable node, skipping.');
			return;
		}

		const nodeIndex = this.#getNavigationIndexFromNode(node);

		if (nodeIndex === undefined) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: node missing navigation id.', node);
			return;
		}

		console.debug('ARROW SCOPE FOCUS_CHANGE: Setting current node/index', {
			nodeIndex,
			node
		});

		this.#setCurrentNode(node);
	};
}
