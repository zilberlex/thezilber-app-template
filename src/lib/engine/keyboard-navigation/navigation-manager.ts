import { createKeyabordNavigationEventHandler } from '$lib/engine/hotkeys/bl-events';
import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
import { engineAssert } from '$lib/engine/error/engine-assert';
import { type NavigationKeysConfig, type NavigationTargetRestorationPoint, type ScopeInfra } from './types';
import { HotKey } from '../hotkeys/hotkey-class';
import { hotkeys } from '../hotkeys/hotkey-helpers';
import { PriorityMapList } from '../patterns/lists-and-maps-advanced/priority-map-list';

const DEFAULT_SCOPE_ORDER = 1;

export class NavigationManager {
	#scopeEntries = new PriorityMapList<string, ScopeEntry>();
	#navigationKeys: NavigationKeysConfig;

	#currentScopeId?: string;

	#allNavigationKeys: OneToManyDictionary<string, ScopeInfra> = new OneToManyDictionary<string, ScopeInfra>();

	#nextScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option');

	#prevScopeNavigationKeys = hotkeys(['tab'], 'ctrl|option', 'shift');

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

	registerScope(scope: ScopeInfra, scopeOrder?: number) {
		const scopeId = scope.scopeId;
		const prevEntryExisted = this.#scopeEntries.has(scopeId);
		console.debug('NavigationManager registering scope:', {
			scopeId,
			prevEntryExisted
		});

		let entry = this.#scopeEntries.get(scopeId);

		engineAssert(
			entry?.scope === undefined,
			`NavigationManager cannot register multiple live scopes with the same scope ID.`,
			{
				scopeId,
				newScope: scope,
				existingLiveScope: entry?.scope,
				registeredScopeIds: [...this.#scopeEntries.entries()]
					.filter(([, entry]) => entry.scope !== undefined)
					.map(([scopeId]) => scopeId)
			}
		);

		if (!entry) {
			entry = {};

			this.#scopeEntries.insert(scopeId, entry, scopeOrder ?? DEFAULT_SCOPE_ORDER);
		}

		entry.scope = scope;

		const activeElement = document.activeElement;

		const hasActiveTarget = activeElement instanceof HTMLElement && scope.hasNavigationTargetForNode(activeElement);

		if (entry.navigationTargetRestorationPoint && !hasActiveTarget) {
			scope.restoreNavigationTarget(entry.navigationTargetRestorationPoint);
		}

		this.#addNavigationKeys(scope, scope.navigationKeys);

		const scopeFocusHandler = this.#createScopeFocusHandler(scope);
		entry.removeFocusListener = scope.registerOnFocus(scopeFocusHandler);

		if (hasActiveTarget) {
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

		const entry = this.#scopeEntries.get(scope.scopeId);

		if (!entry?.scope) {
			console.warn('NavigationManager - unregisterScope - scope not found. scopeId:', scope.scopeId);
			return;
		}

		entry.navigationTargetRestorationPoint = scope.getNavigationTargetRestorationPoint();

		this.removeNavigationKeys(scope, scope.navigationKeys);
		entry.removeFocusListener?.();

		entry.scope = undefined;
		entry.removeFocusListener = undefined;
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

		for (const entry of this.#scopeEntries.values()) {
			entry.removeFocusListener?.();
		}
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
			scopes: this.#scopeEntries,
			currentScope,
			currentScopeName: currentScope?.scopeId,
			currentScopeIndex:
				this.#currentScopeId !== undefined ? this.#scopeEntries.indexOf(this.#currentScopeId) : undefined,
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
		const entry = this.#scopeEntries.get(scope.scopeId);

		if (entry?.scope !== scope) {
			console.warn('NavigationManager Could not Find live scope', scope.scopeId);
			return;
		}

		this.#currentScopeId = scope.scopeId;
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
		const scopeIndex = this.#scopeEntries.indexOf(scope.scopeId);

		if (scopeIndex === -1 || this.#scopeEntries.size === 0) {
			return;
		}

		let index = scopeIndex;

		do {
			if (direction === 'forward') {
				index = (index + 1) % this.#scopeEntries.size;
			} else {
				index = index > 0 ? index - 1 : this.#scopeEntries.size - 1;
			}

			const candidateScope = this.#scopeEntries.at(index)?.scope;

			if (candidateScope?.currentNavigationTarget) {
				return candidateScope;
			}
		} while (index !== scopeIndex);

		return;
	}

	#getCurrentScope(): ScopeInfra | undefined {
		if (this.#currentScopeId === undefined) return undefined;

		return this.#scopeEntries.get(this.#currentScopeId)?.scope;
	}

	#focusBackupScope() {
		let currentScopeIndex: number | undefined;

		if (this.#currentScopeId !== undefined) {
			const index = this.#scopeEntries.indexOf(this.#currentScopeId);

			if (index !== -1) {
				currentScopeIndex = index;
			}
		}

		const backupScope = this.#findClosestNavigatableScope(currentScopeIndex);

		if (!backupScope) {
			console.warn('NavigationManager no usable scope present');
			return;
		}

		this.#focusScope(backupScope);
	}

	#findClosestNavigatableScope(indexHint: number | undefined): ScopeInfra | undefined {
		if (this.#scopeEntries.size === 0) {
			return;
		}

		if (indexHint === undefined) {
			for (const entry of this.#scopeEntries.values()) {
				if (entry.scope?.currentNavigationTarget) {
					return entry.scope;
				}
			}

			return;
		}

		const startIndex = Math.min(indexHint, this.#scopeEntries.size - 1);

		for (let distance = 0; distance < this.#scopeEntries.size; distance++) {
			const forwardIndex = startIndex + distance;
			const forwardScope = this.#scopeEntries.at(forwardIndex)?.scope;

			if (forwardScope?.currentNavigationTarget) {
				return forwardScope;
			}

			if (distance === 0) continue;

			const backwardIndex = startIndex - distance;
			const backwardScope = this.#scopeEntries.at(backwardIndex)?.scope;

			if (backwardScope?.currentNavigationTarget) {
				return backwardScope;
			}
		}

		return;
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

interface ScopeEntry {
	scope?: ScopeInfra;
	removeFocusListener?: () => void;
	navigationTargetRestorationPoint?: NavigationTargetRestorationPoint;
}
