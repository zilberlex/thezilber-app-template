import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import { untrack } from 'svelte';
import { createCollectionAppContextManager, ctxEquals } from './context-manager.svelte';
import { SmartStore, type SmartStoreOptions } from './smart-store.svelte';
import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { appState } from '$lib/engine/state/application-state.svelte';
import { DataStateManager } from './data-state-manager.svelte';
import type {
	AppRecordRepo,
	CollectionAppBlankResult,
	CollectionAppContext,
	CollectionAppEnvironment,
	CollectionAppError,
	CollectionAppRecordAdapter,
	SyncableAppRecordMetadata
} from './types';

export function collectionAppInit<T>(
	dataPlaceholder: T,
	fallbackData: T,
	recordAdapter: CollectionAppRecordAdapter<T, SyncableAppRecordMetadata>,
	repo: AppRecordRepo<T, SyncableAppRecordMetadata, CollectionAppError>
): CollectionAppEnvironment<T> {
	let store: SmartStore<T>;
	let contextManager = createCollectionAppContextManager();

	let storeOptions = generateStoreOptions(contextManager.appContext, fallbackData);

	store = new SmartStore<T>(
		contextManager.appContext,
		dataPlaceholder,
		repo,
		recordAdapter,
		storeOptions
	);

	let dataStateManager = new DataStateManager(store, contextManager);

	let debugHelper = $state({
		bigIssue: 'All Good'
	});

	$effect(() => {
		let contextKey = contextManager.appContext.itemKey;
		let dataKey = store.dataKey;

		debugHelper.bigIssue =
			dataKey !== contextKey
				? `Context Does Not Correspond with recordKey - contextKey: [${contextKey}], recordKey: [${dataKey}]`
				: 'All Good';
	});

	console.log('Collection App Initiated. Context:', $state.snapshot(contextManager.appContext));

	let ret: CollectionAppEnvironment<T> = {
		destroy: $effect.root(() => {
			$effect(() => {
				let ctxChangeEvent = contextManager.appContextChangeEvent;
				track(ctxChangeEvent);

				untrack(() => {
					if (!ctxChangeEvent) return;
					if (
						ctxChangeEvent?.kind === 'browser-navigation' &&
						ctxChangeEvent.prevContext.itemKey !== ctxChangeEvent.newContext.itemKey
					) {
						console.log(
							'context change due to browser-navigation, reloading store. - new context',
							$state.snapshot(ctxChangeEvent.newContext),
							'prevContext',
							$state.snapshot(ctxChangeEvent.prevContext)
						);

						store.reload(contextManager.appContext);
					}
				});
			});

			$effect(() => {
				track(dataStateManager.currentDataState);

				untrack(() => {
					if (dataStateManager.currentDataState?.kind === 'record-not-found') {
						console.log('itemKey not found - Rerouting to "/"');
						contextManager.changeContext('');
					}
				});
			});

			appState.debug.viewObjects.set('Record Key and Context Correlation Helper', debugHelper);
			$effect(() => {
				appState.debug.viewObjects.set('currentDataState', dataStateManager.currentDataState);
			});

			$effect(() => {
				appState.debug.viewObjects.set('Projected Context', contextManager.projectedContext);
				appState.debug.viewObjects.set('projectedDataState', dataStateManager.projectedDataState);
			});

			appState.debug.viewObjects.set('DataStates', dataStateManager.dataStates);

			return () => {
				console.log(
					'destroying CollectionAppEnvironment. CurrentData',
					$state.snapshot(store.data)
				);
			};
		}),
		get data() {
			return store.data;
		},
		get currentDataState() {
			// TODO AZ clean this up, maybe add another state kind.
			return (
				dataStateManager.currentDataState ?? {
					key: contextManager.appContext.itemKey,
					kind: 'loading',
					context: $state.snapshot(contextManager.appContext)
				}
			);
		},
		get projectedDataState() {
			// TODO AZ clean this up, maybe add another state kind.
			return dataStateManager.projectedDataState;
		},
		get editMode() {
			return contextManager.appContext.editMode;
		},
		get itemKey() {
			return contextManager.appContext.itemKey;
		},
		save: async () => {
			let res = await store.save();

			if (
				res.ok &&
				res.value.kind === 'update-with-key-change' &&
				ctxEquals(res.value.context, contextManager.appContext)
			) {
				console.log(
					'keychange changeContext new key:',
					res.value.newItemKey,
					'old key:',
					res.value.prevItemKey
				);

				contextManager.replaceContext(res.value.context, res.value.newItemKey);
			}

			return res as CollectionAppBlankResult;
		},
		saveAs: async (newItemKey: string) => {
			let ctxSnapshot = $state.snapshot(contextManager.appContext);
			try {
				// TODO AZ make store receive snapshots everywhere.

				contextManager.changeProjectedContext(newItemKey);
				let res = await store.saveAs(contextManager.appContext, newItemKey);

				if (res.ok) {
					if (res.value.kind === 'update-with-key-change' || res.value.kind === 'create') {
						if (res.value.kind === 'create') {
							console.log('keychange Create changeContext new key:', res.value.newItemKey);
							contextManager.changeContext(res.value.newItemKey);
						} else {
							console.log(
								'keychange ReplaceKey changeContext new key:',
								res.value.newItemKey,
								'old key:',
								res.value.prevItemKey ?? 'NoKeyInCreate'
							);
							contextManager.replaceContext(res.value.context, res.value.newItemKey);
						}
					}
				}

				contextManager.resetProjectedContext();

				return res as CollectionAppBlankResult;
			} catch (e) {
				console.error('saveAs Error', e);
				return {
					ok: false,
					error: { kind: 'General Error', message: getErrorMessage(e), context: ctxSnapshot }
				};
			}
		},
		delete: async () => {
			let contextSnapshot = $state.snapshot(contextManager.appContext);
			try {
				let ret = await store.delete(contextSnapshot);

				if (ret.ok) {
					console.log('Successfully Deleted Record. [', ret.value.key, ']. Rerouting...');
					if (contextManager.appContext.editMode === 'permanent') {
						contextManager.changeContext('');
					}
					store.reload(
						contextManager.appContext,
						dataPlaceholder,
						generateStoreOptions(contextManager.appContext, fallbackData)
					);
				}

				return ret as CollectionAppBlankResult;
			} catch (e) {
				console.error('delete Error', e);
				return {
					ok: false,
					error: { kind: 'General Error', message: getErrorMessage(e), context: contextSnapshot }
				};
			}
		}
	};

	// TODO AZ add destroyer and a save on destroy.
	// let autoSaver = new AutoSaver(ret.data, () => ret.save());
	return ret;
}

function generateStoreOptions<T>(
	appContext: CollectionAppContext,
	fallbackData: T
): SmartStoreOptions<T> {
	if (appContext.editMode === 'permanent') {
		return {
			loadNotFoundBehavior: { action: 'error' }
		};
	} else {
		return {
			loadNotFoundBehavior: {
				action: 'create-new',
				createObj: () => fallbackData
			}
		};
	}
}
