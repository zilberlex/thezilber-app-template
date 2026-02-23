import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import { untrack } from 'svelte';
import { AutoSaver } from '../auto-saver.svelte';
import { createCollectionAppContextManager } from './context-manager.svelte';
import { SmartStore, type SmartStoreOptions } from './smart-store.svelte';
import { track } from '$lib/engine/svelte-helpers/track.svelte';

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

	console.log(`loaded collection application context.`, $state.snapshot(contextManager.appContext));

	let ret: CollectionAppEnvironment<T> = {
		destroy: $effect.root(() => {
			$effect(() => {
				let ctxChangeEvent = contextManager.appContextChangeEvent;
				track(ctxChangeEvent);

				untrack(() => {
					if (!ctxChangeEvent) return;
					if (
						ctxChangeEvent?.kind === 'browser-navigation' &&
						ctxChangeEvent.prevContext !== ctxChangeEvent.newContext
					) {
						console.log(
							'context change due to browser-navigation, reloading store. - new context',
							$state.snapshot(contextManager.appContext)
						);

						store.reload(contextManager.appContext);
					}
				});
			});

			$effect(() => {
				let dataState = store.dataState;
				track(dataState);

				untrack(() => {
					console.log('itemKey not found - Rerouting to "/"');

					if (dataState.kind === 'record-not-found') {
						contextManager.moveRouteRelative('');
					}
				});
			});

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
		get dataState() {
			return store.dataState;
		},
		get editMode() {
			return contextManager.appContext.editMode;
		},
		get itemKey() {
			return contextManager.appContext.itemKey;
		},
		save: async () => {
			let res = await store.save();

			if (res.ok && res.value.kind === 'update-with-key-change') {
				contextManager.moveRouteRelative(res.value.newItemKey);
			}

			return res as CollectionAppBlankResult;
		},
		saveAs: async (newItemKey: string) => {
			try {
				let ret = await store.saveAs(contextManager.appContext, newItemKey);

				if (ret.ok) {
					if (ret.value.kind === 'update-with-key-change' || ret.value.kind === 'create') {
						contextManager.moveRouteRelative(ret.value.newItemKey);
					}
				}

				return ret as CollectionAppBlankResult;
			} catch (e) {
				console.error('saveAs Error', e);
				return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
			}
		},
		delete: async () => {
			try {
				let ret = await store.delete(contextManager.appContext);

				if (ret.ok) {
					if (contextManager.appContext.editMode === 'permanent') {
						contextManager.moveRouteRelative('/');
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
				return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
			}
		}
	};

	// TODO AZ add destroyer and a save on destroy.
	let autoSaver = new AutoSaver(ret.data, () => ret.save());

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
