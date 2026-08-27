import { createKeyabordNavigationEventHandler } from '$lib/engine/hotkeys/bl-events';
import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
import { engineAssert } from '$lib/engine/error/engine-assert';
import { type NavigationKeysConfig, type ScopeInfra } from './types';
import { HotKey } from '../hotkeys/hotkey-class';
import { hotkeys } from '../hotkeys/hotkey-helpers';
import { MruMap } from '../patterns/mru-map';

export class NavigationManager {
	#scopes: ScopeInfra[] = [];
	#navigationKeys: NavigationKeysConfig;

	#currentScopeId?: string;
	#currentScopeIndexHint?: number;

	#allNavigationKeys: OneToManyDictionary<string, ScopeInfra> = new OneToManyDictionary<string, ScopeInfra>();

	#nextScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option');

	#prevScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option', 'shift');

	#destTargets: { unregister: () => void }[] = [];
	#assignHotKeysCounter = 0;

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

		const existingLiveScope = this.#scopes.find((existingScope) => existingScope.scopeId === scope.scopeId);

		engineAssert(
			existingLiveScope === undefined,
			`NavigationManager cannot register multiple live scopes with the same scope ID.`,
			{
				scopeId: scope.scopeId,
				newScope: scope,
				existingLiveScope,
				registeredScopeIds: this.#scopes.map((scope) => scope.scopeId)
			}
		);

		this.#scopes.push(scope);
		this.#addNavigationKeys(scope, scope.navigationKeys);

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

		const scopeIndex = this.#getScopeIndex(scope);

		if (scopeIndex === -1) {
			console.warn('NavigationManager - unregisterScope - scope not found. scopeId:', scope.scopeId);
			return;
		}

		const wasCurrentScope = this.#currentScopeId === scope.scopeId;

		this.#scopes.splice(scopeIndex, 1);

		const { unregister } = this.#destTargets.splice(scopeIndex, 1)[0];

		this.removeNavigationKeys(scope, scope.navigationKeys);
		unregister();

		if (wasCurrentScope) {
			this.#currentScopeIndexHint = scopeIndex;
			return;
		}

		const currentScope = this.#getCurrentScope();

		if (currentScope) {
			this.#currentScopeIndexHint = this.#getScopeIndex(currentScope);
		} else if (this.#currentScopeIndexHint !== undefined && scopeIndex < this.#currentScopeIndexHint) {
			this.#currentScopeIndexHint--;
		}
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
		const scope = this.#getCurrentScope();

		if (!scope) {
			this.#focusBackupScope();
			return;
		}

		scope.focusCurrent();
	}

	focusNextScope() {
		const currentScope = this.#getCurrentScope();
		if (!currentScope) {
			this.#focusBackupScope();
			return;
		}

		let nextScope = this.#nextScopeFrom(currentScope, 'forward');
		if (nextScope) {
			this.#focusScope(nextScope);
		}
	}

	focusPrevScope() {
		const currentScope = this.#getCurrentScope();
		if (!currentScope) {
			this.#focusBackupScope();
			return;
		}

		let nextScope = this.#nextScopeFrom(currentScope, 'backward');

		if (nextScope) {
			this.#focusScope(nextScope);
		}
	}

	_debugInfo() {
		const currentScope = this.#getCurrentScope();

		return {
			scopes: this.#scopes,
			currentScope: currentScope,
			currentScopeName: currentScope?.scopeId,
			currentScopeIndex: this.#currentScopeIndexHint,
			currentNavigationTarget: currentScope?.currentNavigationTarget
		};
	}

	#focusScope(scope: ScopeInfra, which: 'current' | 'first' | 'last' = 'current') {
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

		this.#currentScopeId = scope.scopeId;
		this.#currentScopeIndexHint = scopeIndex;
	}

	#onNavigationKey = createKeyabordNavigationEventHandler((keyboardEvent: KeyboardEvent) => {
		const currentScope = this.#getCurrentScope();

		if (!currentScope) {
			this.#focusBackupScope();
			return;
		}

		const key = keyboardEvent.key;
		let nextNodeInfo = currentScope.getNextNodeInfo(key);

		console.debug(
			'NavigationManager - keyboardEvent key,',
			key,
			'currentScope',
			currentScope,
			'nextNodeInfo nextNode:',
			nextNodeInfo.nextNode,
			'nextNodeInfo escapeBackupNode:',
			nextNodeInfo.escapeBackupNode
		);

		if (nextNodeInfo.nextNode) {
			this.#focusNode(currentScope, nextNodeInfo.nextNode.navigatableNode);
		} else {
			let nextScope = null;
			const nextKey = this.#isNextKey(key);
			const prevKey = this.#isPrevKey(key);

			if (nextKey === true) {
				nextScope = this.#nextScopeFrom(currentScope, 'forward');
			} else if (prevKey === true) {
				nextScope = this.#nextScopeFrom(currentScope, 'backward');
			}

			if (nextScope != null && (nextKey || prevKey)) {
				this.#focusScope(nextScope, nextKey ? 'first' : 'last');
			} else if (nextNodeInfo.escapeBackupNode) {
				this.#focusNode(currentScope, nextNodeInfo.escapeBackupNode.navigatableNode);
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

	#nextScopeFrom(scope: ScopeInfra, direction: 'forward' | 'backward'): ScopeInfra | undefined {
		const scopeIndex = this.#getScopeIndex(scope);

		if (scopeIndex === -1 || this.#scopes.length === 0) {
			return;
		}

		let index = scopeIndex;

		do {
			if (direction === 'forward') {
				index = (index + 1) % this.#scopes.length;
			} else {
				index = index > 0 ? index - 1 : this.#scopes.length - 1;
			}

			const candidateScope = this.#scopes[index];

			if (candidateScope.currentNavigationTarget) {
				return candidateScope;
			}
		} while (index !== scopeIndex);

		return;
	}

	#getCurrentScope(): ScopeInfra | undefined {
		if (this.#currentScopeId === undefined) return undefined;

		return this.#scopes.find((scope) => scope.scopeId === this.#currentScopeId);
	}

	#focusBackupScope() {
		const backupScope = this.#findClosestNavigatableScope(this.#currentScopeIndexHint);

		if (!backupScope) {
			console.warn('NavigationManager no usable scope present');
			return;
		}

		this.#focusScope(backupScope);
	}

	#findClosestNavigatableScope(indexHint: number | undefined): ScopeInfra | undefined {
		if (this.#scopes.length === 0) {
			return undefined;
		}

		if (indexHint === undefined) {
			return this.#scopes.find((scope) => scope.currentNavigationTarget !== undefined);
		}

		const startIndex = Math.min(indexHint, this.#scopes.length - 1);

		for (let distance = 0; distance < this.#scopes.length; distance++) {
			const forwardIndex = startIndex + distance;

			if (forwardIndex < this.#scopes.length && this.#scopes[forwardIndex].currentNavigationTarget) {
				return this.#scopes[forwardIndex];
			}

			if (distance === 0) continue;

			const backwardIndex = startIndex - distance;

			if (backwardIndex >= 0 && this.#scopes[backwardIndex].currentNavigationTarget) {
				return this.#scopes[backwardIndex];
			}
		}

		return undefined;
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
