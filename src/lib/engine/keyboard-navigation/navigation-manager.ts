import { createKeyabordNavigationEventHandler } from '$lib/engine/hotkeys/bl-events';
import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
import { type NavigationKeysConfig, type ScopeInfra } from './types';
import { HotKey } from '../hotkeys/hotkey-class';
import { hotkeys } from '../hotkeys/hotkey-helpers';
import { MruMap } from '../patterns/mru-map';

export class NavigationManager {
	#scopes: ScopeInfra[] = [];
	#navigationKeys: NavigationKeysConfig;
	#currentScopeIndex: number = 0;

	#allNavigationKeys: OneToManyDictionary<string, ScopeInfra> = new OneToManyDictionary<string, ScopeInfra>();

	#nextScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option');

	#prevScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option', 'shift');

	#scopeHistory = new MruMap<string, ScopeInfra>();

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

	registerScope(scope: ScopeInfra) {
		console.debug('NavigationManager registering scope:', scope.scopeId);
		const scopeId = scope.scopeId;

		const scopes = this.#scopes;

		if (scopes.findIndex((s) => s.scopeId === scope.scopeId) !== -1) {
			throw new Error(`NavigationManager Duplicate scope id ${scope.scopeId}`);
		}

		this.#scopes.push(scope);
		this.#addNavigationKeys(scope, scope.navigationKeys);
		this.#scopeHistory.set(scopeId, scope);

		const scopeFocusHandler = this.#createScopeFocusHandler(scope);

		const i = this.#getScopeIndex(scope);
		this.#destTargets[i] = scope.registerOnFocus(scopeFocusHandler);

		const activeElement = document.activeElement;

		if (
			activeElement instanceof HTMLElement &&
			scope.navigationTargets.some((x) => x.navigatableNode === activeElement)
		) {
			scopeFocusHandler();
		}
	}

	#createScopeFocusHandler(scope: ScopeInfra) {
		return () => {
			this.#onFocusScopeInternal(scope);
		};
	}

	unregisterScope(scope: ScopeInfra) {
		console.debug('NavigationManager unregistering scope:', scope.scopeId);

		const i = this.#getScopeIndex(scope);

		if (i != -1) {
			this.#scopes.splice(i, 1);
			const { unregister } = this.#destTargets.splice(i, 1)[0];
			this.removeNavigationKeys(scope, scope.navigationKeys);

			this.#scopeHistory.delete(scope.scopeId);

			unregister();
			if (this.#currentScopeIndex === i) {
				let newScope = this.#scopes.at(-1);
				let lastHistoryScope = this.#scopeHistory.current;

				if (lastHistoryScope) {
					newScope = lastHistoryScope;
				}

				if (newScope) {
					this.#focusScopeNew(newScope);
				}
			}
		} else
			console.warn('NavigationManager - unregisterScope - scope not found in destTargets. scopeName:', scope.scopeId);
	}

	#getScopeIndex(scope: ScopeInfra): number {
		return this.#scopes.findIndex((s) => s.scopeId === scope.scopeId);
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

		matchedSetIndex === 0 ? this.focusNextScope() : this.focusPrevScope();
	}, 'soft');

	refocus() {
		let target = this.#currentScope.currentNavigationTarget;
		console.log('Refocusing', target);

		target?.navigatableNode?.focus();
	}

	focusNextScope() {
		let nextScope = this.#nextScope('forward');
		if (nextScope) {
			this.#focusScopeNew(nextScope);
		}
	}

	focusPrevScope() {
		let nextScope = this.#nextScope('backward');

		if (nextScope) {
			this.#focusScopeNew(nextScope);
		}
	}

	_debugInfo() {
		return {
			scopes: this.#scopes,
			currentScope: this.#currentScope,
			currentScopeName: this.#currentScope.scopeId,
			currentScopeIndex: this.#currentScopeIndex,
			currentNavigationTarget: this.#currentScope.currentNavigationTarget,
			navigationHistory: this.#scopeHistory.getAll()
		};
	}

	#focusScopeNew(scope: ScopeInfra, which: 'current' | 'first' | 'last' = 'current') {
		this.#onFocusScopeInternal(scope);

		switch (which) {
			case 'current':
				scope.focusCurrent();
				break;
			case 'first':
				scope.focusFirst();
				break;
			case 'last':
				scope.focusLast();
				break;
		}
	}

	#focusNode(scope: ScopeInfra, scopeNode: HTMLElement) {
		this.#onFocusScopeInternal(scope);
		keyBoardFocusNavigatedNode(scopeNode);
	}

	#onFocusScopeInternal(scope: ScopeInfra) {
		const scopeIndex = this.#getScopeIndex(scope);

		if (scopeIndex < 0) {
			console.warn('NavigationManager Could not Find scope', scope.scopeId);
			return;
		}

		this.#currentScopeIndex = scopeIndex;
		this.#scopeHistory.touch(scope.scopeId);
	}

	#onNavigationKey = createKeyabordNavigationEventHandler((keyboardEvent: KeyboardEvent) => {
		if (this.#scopes.length == 0) {
			console.warn('NavigationManager no scopes present. Ignoring key');
			return;
		}

		const key = keyboardEvent.key;

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

		if (nextNodeInfo.nextNode) {
			this.#focusNode(this.#currentScope, nextNodeInfo.nextNode.navigatableNode);
		} else {
			let nextScope = null;
			const nextKey = this.#isNextKey(key);
			const prevKey = this.#isPrevKey(key);

			if (nextKey === true) {
				nextScope = this.#nextScope('forward');
			} else if (prevKey === true) {
				nextScope = this.#nextScope('backward');
			}

			if (nextScope != null && (nextKey || prevKey)) {
				this.#focusScopeNew(nextScope, nextKey ? 'first' : 'last');
			} else if (nextNodeInfo.escapeBackupNode) {
				// Navigate to current scope backup node

				this.#focusNode(this.#currentScope, nextNodeInfo.escapeBackupNode.navigatableNode);
			}
		}
	});

	#addNavigationKeys(scope: ScopeInfra, navigationKeys: NavigationKeysConfig) {
		const flatNavigationKeys = navigationKeys.prevKeys.concat(navigationKeys.nextKeys);

		console.log(`NavigationManager - adding NavigationKeys`, flatNavigationKeys);

		hotKeysModule.assignHotKeys(
			flatNavigationKeys.map((x) => new HotKey(x)),
			this.#onNavigationKey
		);
		flatNavigationKeys.forEach((key) => this.#allNavigationKeys.add(key, scope));
	}

	#nextScope(direction: 'forward' | 'backward') {
		const currentScopeIndex = this.#currentScopeIndex;
		let index = currentScopeIndex;

		if (this.#scopes.length === 0) {
			return null;
		}

		do {
			if (direction === 'forward') {
				index++;
				index %= this.#scopes.length;
			} else {
				index--;
				index = index >= 0 ? index : this.#scopes.length - 1;
			}

			const scopeAtIndex = this.#scopes[index];
			const navigationTarget = scopeAtIndex.currentNavigationTarget;
			const isInert =
				navigationTarget &&
				navigationTarget.navigatableNode &&
				navigationTarget.navigatableNode.closest('[inert]') !== null;
			console.debug('NAVIGATION Checking Next Scope', {
				scope: scopeAtIndex.scopeId,
				currentScopeNode: scopeAtIndex.currentNavigationTarget,
				isInert
			});

			if (!isInert) {
				console.debug('NAVIGATION currentScopeIndex', this.#currentScopeIndex, 'nextScopeIndex:', index);

				return this.#scopes[index];
			}
		} while (index !== currentScopeIndex);

		console.debug('NAVIGATION no next scope found. Next Scope Remains', currentScopeIndex);
		return this.#scopes[index];
	}

	#isPrevKey(key: string): boolean {
		const navKeys = this.#navigationKeys;
		return navKeys.prevKeys.includes(key);
	}

	#isNextKey(key: string): boolean {
		const navKeys = this.#navigationKeys;
		return navKeys.nextKeys.includes(key);
	}
}
