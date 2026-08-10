import { createKeyabordNavigationEventHandler } from '$lib/engine/hotkeys/bl-events';
import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import { DispatcherImpl } from '$lib/engine/patterns/observer';
import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
import { type NavigationKeysConfig, type ScopeInfra } from './types';
import { HotKey } from '../hotkeys/hotkey-class';
import { hotkeys } from '../hotkeys/hotkey-helpers';

interface NavigationEvent {
	targetNode: HTMLElement;
	initiatingKey: string;
}

export class NavigationManager {
	#scopes: ScopeInfra[] = [];
	#navigationKeys: NavigationKeysConfig;
	#currentScopeIndex: number = 0;
	#dispatcher = new DispatcherImpl<NavigationEvent>();

	#allNavigationKeys: OneToManyDictionary<string, ScopeInfra> = new OneToManyDictionary<string, ScopeInfra>();

	#nextScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option');

	#prevScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option', 'shift');

	#destTargets: { unregister: () => void }[] = [];
	#assignHotKeysCounter = 0;

	get #currentScope(): ScopeInfra {
		return this.#scopes[this.#currentScopeIndex];
	}

	constructor(navigationKeys?: NavigationKeysConfig) {
		this.#navigationKeys = navigationKeys ?? {
			nextKeys: [NavigationKeyConsts.ArrowDown],
			prevKeys: [NavigationKeyConsts.ArrowUp]
		};
	}

	init() {
		hotKeysModule.assignHotKeys(
			[...this.#nextScopeNavigationKeys, ...this.#prevScopeNavigationKeys],
			this.#onChangeScopeKey,
			false
		);
	}

	assignScopeNavigationKeys(nextScopeKeys: HotKey[], prevScopeKeys: HotKey[]) {
		let relevantCounter = ++this.#assignHotKeysCounter;

		let prevState = {
			nextScopeKeys: this.#nextScopeNavigationKeys,
			prevScopeKeys: this.#prevScopeNavigationKeys
		};

		hotKeysModule.removeHotKeys(
			[...this.#nextScopeNavigationKeys, ...this.#prevScopeNavigationKeys],
			this.#onChangeScopeKey
		);

		this.#nextScopeNavigationKeys = nextScopeKeys;
		this.#prevScopeNavigationKeys = prevScopeKeys;

		hotKeysModule.assignHotKeys(
			[...this.#nextScopeNavigationKeys, ...this.#prevScopeNavigationKeys],
			this.#onChangeScopeKey,
			false
		);

		return () => {
			if (relevantCounter != this.#assignHotKeysCounter) {
				console.warn(
					'Undo Assign Scope Navigation Counter discrepancy. Undo relevantCounter',
					relevantCounter,
					'assignHotKeysCounter:',
					this.#assignHotKeysCounter
				);
				return;
			}

			hotKeysModule.removeHotKeys([...nextScopeKeys, ...prevScopeKeys], this.#onChangeScopeKey);

			this.#nextScopeNavigationKeys = prevState.nextScopeKeys;
			this.#prevScopeNavigationKeys = prevState.prevScopeKeys;

			hotKeysModule.assignHotKeys(
				[...this.#nextScopeNavigationKeys, ...this.#prevScopeNavigationKeys],
				this.#onChangeScopeKey,
				false
			);

			this.#assignHotKeysCounter--;
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

		const activeElement = document.activeElement;

		if (activeElement instanceof HTMLElement && scope.navigatiableNodes.includes(activeElement)) {
			this.#currentScopeIndex = i;
		}
	}

	unregisterScope(scope: ScopeInfra) {
		console.debug('NavigationManager unregistering scope:', scope.scopeName);

		const i = this.#getScopeIndex(scope);

		this.removeNavigationKeys(scope, scope.navigationKeys);

		if (i != -1) {
			this.#scopes = this.#scopes.filter((s) => s.scopeName !== scope.scopeName);
			const { unregister } = this.#destTargets.splice(i, 1)[0];
			unregister();
			if (this.#currentScopeIndex >= i) {
				this.#currentScopeIndex--;
				this.#currentScopeIndex = Math.max(this.#currentScopeIndex, 0);
			}
		} else
			console.warn('NavigationManager - unregisterScope - scope not found in destTargets. scopeName:', scope.scopeName);
	}

	#getScopeIndex(scope: ScopeInfra): number {
		return this.#scopes.findIndex((s) => s.scopeName === scope.scopeName);
	}

	removeNavigationKeys(source: ScopeInfra, navigationKeys: NavigationKeysConfig) {
		const flatNavigationKeys = navigationKeys.prevKeys.concat(navigationKeys.nextKeys);

		console.log(`NavigationManager - removing NavigationKeys`, flatNavigationKeys);

		flatNavigationKeys.forEach((key) => {
			this.#allNavigationKeys.remove(key, source);

			if (!this.#allNavigationKeys.has(key)) {
				hotKeysModule.removeHotKey(new HotKey(key), this.#onNavigationKey);
			}
		});
	}

	destroy() {
		hotKeysModule.removeHotKeys(
			[...this.#nextScopeNavigationKeys, ...this.#prevScopeNavigationKeys],
			this.#onChangeScopeKey
		);
		this.#destTargets.forEach((dest) => dest.unregister());
	}

	#onChangeScopeKey = createKeyabordNavigationEventHandler((keyboardEvent: KeyboardEvent) => {
		let eventHotkey = HotKey.fromEvent(keyboardEvent);

		const matchedSetIndex = eventHotkey.bestMatchingSetIndex([
			this.#nextScopeNavigationKeys,
			this.#prevScopeNavigationKeys
		]);

		if (matchedSetIndex === undefined) return;

		const nextScopeIndex = matchedSetIndex === 0 ? this.#nextScopeIndex() : this.#prevScopeIndex();

		console.log('Scope Change - Key', eventHotkey, 'nextScopeIndex:', nextScopeIndex);

		if (nextScopeIndex !== undefined && nextScopeIndex !== this.#currentScopeIndex) {
			this.#currentScopeIndex = nextScopeIndex;
			const nextScope = this.#scopes[nextScopeIndex];
			let nodeToFocus = nextScope.currentNode;
			if (nodeToFocus) {
				this.#navigateToNodeAndCompleteQuestForKey(nodeToFocus, eventHotkey.key, document.activeElement as HTMLElement);
			}
		}
	}, 'hard');

	refocus() {
		let target = this.#currentScope.currentNode;
		console.log('Refocusing', target);

		target?.focus();
	}

	focusNextScope() {
		this.#focusScopeInternal(this.#nextScopeIndex());
	}

	focusPrevScope() {
		this.#focusScopeInternal(this.#prevScopeIndex());
	}

	#focusScopeInternal(scopeIndex: number) {
		if (scopeIndex !== undefined && scopeIndex !== this.#currentScopeIndex) {
			this.#currentScopeIndex = scopeIndex;
			const nextScope = this.#scopes[scopeIndex];
			let nodeToFocus = nextScope.currentNode;
			if (nodeToFocus) {
				keyBoardFocusNavigatedNode(nodeToFocus);
			}
		}
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
			'nextNodeInfo nextNode:',
			nextNodeInfo.nextNode,
			'nextNodeInfo escapeBackupNode:',
			nextNodeInfo.escapeBackupNode
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
				this.#navigateToNodeAndCompleteQuestForKey(nextScope.navigatiableNodes[nodeIndex], key, initatingNode);
				this.#currentScopeIndex = nextScopeIndex;
			} else if (nextNodeInfo.escapeBackupNode) {
				// Navigate to current scope backup node
				this.#navigateToNodeAndCompleteQuestForKey(nextNodeInfo.escapeBackupNode, key, initatingNode);
			}
		}
	});

	private addNavigationKeys(source: ScopeInfra, navigationKeys: NavigationKeysConfig) {
		const flatNavigationKeys = navigationKeys.prevKeys.concat(navigationKeys.nextKeys);

		console.log(`NavigationManager - adding NavigationKeys`, flatNavigationKeys);

		hotKeysModule.assignHotKeys(
			flatNavigationKeys.map((x) => new HotKey(x)),
			this.#onNavigationKey
		);
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
			return this.#nextScopeIndex();
		} else if (this.#isPrevKey(key)) {
			return this.#prevScopeIndex();
		}

		return null;
	}

	#nextScopeIndex() {
		let ret = (this.#currentScopeIndex + 1) % this.#scopes.length;
		console.log('currentScopeIndex', this.#currentScopeIndex, 'nextScope:', ret);

		return ret;
	}

	#prevScopeIndex() {
		const prevScopeIndex = this.#currentScopeIndex - 1;

		return prevScopeIndex >= 0 ? prevScopeIndex : this.#scopes.length - 1;
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
		initiatingNode: HTMLElement | undefined | null
	) {
		if (node && node !== initiatingNode) {
			keyBoardFocusNavigatedNode(node);
			this.#dispatcher.signal({ targetNode: node, initiatingKey: key });
		}
	}

	_debugInfo() {
		return {
			scopes: this.#scopes,
			currentScope: this.#currentScope,
			currentScopeName: this.#currentScope.scopeName,
			currentScopeIndex: this.#currentScopeIndex
		};
	}
}
