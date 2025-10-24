import { createSmartHandler } from '$lib/engine/events/event-handling';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import type {
	NavigationKeysConfig,
	NextNodeInfo,
	ScopeInfra as NavigationScopeInfra,
	NodeFocusEvent
} from '../../my-packages/az-keyboard-navigation/types';
import { getFocusableElementsByNode } from './navigation-utils';

const NAVIGATION_ID_ATTRIBUTE = 'navigation-id';

export default class NavigationScopeInfraImpl implements NavigationScopeInfra {
	scopeName: string;
	navigationKeys: NavigationKeysConfig;

	scopeContainer: HTMLElement;
	navigatiableNodes: HTMLElement[];

	#focusNodeDispatcher = new DispatcherImpl<NodeFocusEvent>(); 

	#abortController: AbortController;

	#currentNodeIndex?: number = undefined;

	constructor(
		scopeContainer: HTMLElement,
		navigationKeys: NavigationKeysConfig,
		scopeName: string
	) {
		this.scopeName = scopeName;
		this.scopeContainer = scopeContainer;
		this.navigationKeys = navigationKeys;

		this.navigatiableNodes = getFocusableElementsByNode(scopeContainer);
		this.#initializeFocusableElements(this.navigatiableNodes);

		this.#abortController = new AbortController();
	}

	init() {
		const { signal } = this.#abortController;

		this.scopeContainer.addEventListener('focusin', this.#onFocusElement_SetCurrentNode, {
			signal
		});

		this.navigatiableNodes.forEach((node) => {
			node.addEventListener('pointerenter', this.#onFocusElement_SetCurrentNode_SmartHandler, { signal });
		});
	}

	destroy() {
		this.#abortController.abort();
	}

	getNextNodeInfo(key: string): NextNodeInfo {
		const navKeys = this.navigationKeys;

		let nextNodeIndex = null;

		if (navKeys.nextKeys.includes(key)) {
			nextNodeIndex = this.#currentNodeIndex !== undefined ? this.#currentNodeIndex + 1 : 0;
		} else if (navKeys.prevKeys.includes(key)) {
			nextNodeIndex =
				this.#currentNodeIndex !== undefined
					? this.#currentNodeIndex - 1
					: this.navigatiableNodes.length - 1;
		}

		let ret: NextNodeInfo = {};

		if (nextNodeIndex == null) {
			return {};
		}

		if (nextNodeIndex >= 0 && nextNodeIndex < this.navigatiableNodes.length) {
			ret.nextNode = this.navigatiableNodes[nextNodeIndex];
		} else {
			// Return either first or last node, depends on side of overflow (circular behavior)
			nextNodeIndex = nextNodeIndex < 0 ? this.navigatiableNodes.length - 1 : 0;

			ret.escapeBackupNode = this.navigatiableNodes[nextNodeIndex];
		}

		return ret;
	}

	registerOnFocus(handler: (dispatchedObject: NodeFocusEvent) => void): { unregister: () => void } {
		this.#focusNodeDispatcher.register(handler);

		return {
			unregister: () => this.#focusNodeDispatcher.unregister(handler)
		}
	}

	#initializeFocusableElements(focusableElements: HTMLElement[]) {
		for (let i = 0; i < focusableElements.length; i++) {
			const node = focusableElements[i];
			console.debug(`FOCUS_CHANGE INIT - Focusable element id [${i}]:`, node);
			node.setAttribute(NAVIGATION_ID_ATTRIBUTE, i.toString());
		}
	}

	#onFocusElement_SetCurrentNode = (event: FocusEvent | PointerEvent) => {
		console.debug(
			'FOCUS_CHANGE handle. .eventType: ',
			event.type,
			', event.target: ',
			event.target,
			', this:',
			this.scopeContainer
		);

		let node = event.target as HTMLElement;
		console.debug('ARROW SCOPE FOCUS_CHANGE: Node focus trigger. Focused node:', node);

		let navid = node.getAttribute(NAVIGATION_ID_ATTRIBUTE);
		if (navid === null) {
			console.warn('ARROW SCOPE FOCUS_CHANGE: reached unnavigatable node, skipping.');
			return;
		}

		let nodeNavId = parseInt(navid);
		if (nodeNavId != 0 && !nodeNavId) {
			console.warn(
				'ARROW SCOPE FOCUS_CHANGE: failed to parse navigation id on node.',
				navid,
				node
			);
			return;
		}

		console.debug('ARROW SCOPE FOCUS_CHANGE: Setting current nodeId', nodeNavId);

		this.#focusNodeDispatcher.signal({ targetNode: node });
		this.#currentNodeIndex = nodeNavId;
	};

	#onFocusElement_SetCurrentNode_SmartHandler = createSmartHandler(this.#onFocusElement_SetCurrentNode, {
		debounceDelay: 50,
		cooldownDelay: 200
	});
}
