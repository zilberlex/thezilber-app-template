import { createKeyabordNavigationEventHandler } from '$lib/engine/hotkeys/bl-events';
import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/types';
import { type NavigationKeysConfig, type ScopeInfra } from './types';

interface NavigationEvent {
	targetNode: HTMLElement;
	initiatingKey: string;
}

export class NavigationManager {
	#scopes: ScopeInfra[] = [];
	#navigationKeys: NavigationKeysConfig;
	#currentScopeIndex: number = 0;
	#dispatcher = new DispatcherImpl<NavigationEvent>();

	#allNavigationKeys: OneToManyDictionary<string, object> = new OneToManyDictionary<
		string,
		ScopeInfra
	>();

	#destTargets: { unregister: () => void }[] = [];

	get #currentScope(): ScopeInfra {
		return this.#scopes[this.#currentScopeIndex];
	}

	constructor(navigationKeys?: NavigationKeysConfig) {
		this.#navigationKeys = navigationKeys ?? {
			nextKeys: [NavigationKeyConsts.ArrowDown],
			prevKeys: [NavigationKeyConsts.ArrowUp]
		};
	}

	registerNavigationHandler(handler: (dispatchedObject: NavigationEvent) => void): () => unknown {
		this.#dispatcher.register(handler);

		return () => this.#dispatcher.unregister(handler);
	}

	registerScope(scope: ScopeInfra) {
		console.debug('NavigationManager registering scope:', scope.scopeName);

		this.#scopes.push(scope);
		this.addNavigationKeys(scope, scope.navigationKeys);

		const i = this.#getScopeIndex(scope);
		this.#destTargets[i] = scope.registerOnFocus(() => (this.#currentScopeIndex = i));
	}

	unregisterScope(scope: ScopeInfra) {
		console.debug('NavigationManager unregistering scope:', scope.scopeName);

		this.#scopes = this.#scopes.filter((s) => s !== scope);
		this.removeNavigationKeys(scope, scope.navigationKeys);

		const i = this.#getScopeIndex(scope);
		if (i != -1) {
			const { unregister } = this.#destTargets.splice(this.#getScopeIndex(scope), 1)[0];
			unregister();
			if (this.#currentScopeIndex >= i) {
				this.#currentScopeIndex--;
				this.#currentScopeIndex = Math.max(this.#currentScopeIndex, 0);
			}
		} else
			console.warn(
				'NavigationManager - unregisterScope - scope not found in destTargets. scopeName:',
				scope.scopeName
			);
	}

	#getScopeIndex(scope: ScopeInfra): number {
		return this.#scopes.findIndex((s) => s === scope);
	}

	removeNavigationKeys(source: object, navigationKeys: NavigationKeysConfig) {
		const flatNavigationKeys = navigationKeys.prevKeys.concat(navigationKeys.nextKeys);

		console.log(`NavigationManager - removing NavigationKeys`, flatNavigationKeys);

		flatNavigationKeys.forEach((key) => {
			this.#allNavigationKeys.remove(key, source);

			if (!this.#allNavigationKeys.has(key)) {
				hotKeysModule.removeHotKeys(flatNavigationKeys, this.#onNavigationKey);
			}
		});
	}

	destroy() {
		this.#destTargets.forEach((dest) => dest.unregister());
	}

	#onNavigationKey = createKeyabordNavigationEventHandler((keyboardEvent: KeyboardEvent) => {
		if (this.#scopes.length == 0) {
			console.warn('NavigationManager no scopes present. Ignoring key');
			return;
		}

		const key = keyboardEvent.key;
		const initatingNode = keyboardEvent.target as HTMLElement;

		let nextNodeInfo = this.#currentScope.getNextNodeInfo(key);

		console.debug(
			'NavigationManager - keyboardEvent key,',
			key,
			'currentScope',
			this.#currentScope,
			'nextNodeInfo:',
			nextNodeInfo
		);

		if (nextNodeInfo.nextNode)
			// Current Scope Navigation
			this.#navigateToNodeAndCompleteQuestForKey(nextNodeInfo.nextNode, key, initatingNode);
		else {
			const nextScopeIndex = this.getNextScopeIndex(key);

			if (nextScopeIndex != null) {
				const nextScope = this.#scopes[nextScopeIndex];

				let nodeIndex = this.#isNextKey(key) ? 0 : nextScope.navigatiableNodes.length - 1;

				// Navigate to next scope
				this.#navigateToNodeAndCompleteQuestForKey(
					nextScope.navigatiableNodes[nodeIndex],
					key,
					initatingNode
				);
				this.#currentScopeIndex = nextScopeIndex;
			} else if (nextNodeInfo.escapeBackupNode) {
				// Navigate to current scope backup node
				this.#navigateToNodeAndCompleteQuestForKey(
					nextNodeInfo.escapeBackupNode,
					key,
					initatingNode
				);
			}
		}
	});

	private addNavigationKeys(source: object, navigationKeys: NavigationKeysConfig) {
		const flatNavigationKeys = navigationKeys.prevKeys.concat(navigationKeys.nextKeys);

		console.log(`NavigationManager - adding NavigationKeys`, flatNavigationKeys);

		hotKeysModule.assignHotKeys(flatNavigationKeys, this.#onNavigationKey);
		flatNavigationKeys.forEach((key) => this.#allNavigationKeys.add(key, source));
	}

	/* Returns the index of scope for navigation according to the key pressed.
	 *
	 * Returns Null/Undefined if no relevant navigation key is pressed
	 * Returns Null/Undefined if scopes length is 1 or less (if scope does not change).
	 **/
	getNextScopeIndex(key: string): number | null {
		if (!this.#scopes.length) return null;

		if (this.#isNextKey(key)) {
			return (this.#currentScopeIndex + 1) % this.#scopes.length;
		} else if (this.#isPrevKey(key)) {
			const prevScopeIndex = this.#currentScopeIndex - 1;

			return prevScopeIndex >= 0 ? prevScopeIndex : this.#scopes.length - 1;
		}

		return null;
	}

	#isPrevKey(key: string): boolean {
		const navKeys = this.#navigationKeys;
		return navKeys.prevKeys.includes(key);
	}

	#isNextKey(key: string): boolean {
		const navKeys = this.#navigationKeys;
		return navKeys.nextKeys.includes(key);
	}

	#navigateToNodeAndCompleteQuestForKey(
		node: HTMLElement,
		key: string,
		initiatingNode: HTMLElement
	) {
		if (node !== initiatingNode) {
			keyBoardFocusNavigatedNode(node);
			this.#dispatcher.signal({ targetNode: node, initiatingKey: key });
		}
	}
}
