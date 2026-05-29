import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import { untrack } from 'svelte';
import { createCollectionAppContextManager, ctxEquals } from './context-manager.svelte';
import { SmartStore, type SmartStoreOptions } from './smart-store.svelte';
import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { DataStateManager } from './data-state-manager.svelte';
import type {
	CollectionAppBlankResult,
	CollectionAppContext,
	CollectionAppEnvironment
} from './types';
import type {
	CollectionAppDbAdapter,
	CollectionAppRecordProjection,
	DataProjection
} from '$lib/app-infrastructure/collection-app/data/types';
import { CollectionAppContextualRepo } from './data/collection-app-contextual-repo';
import { CollectionAppPermanentRepo } from './data/collection-app-permanent-repo';

export function collectionAppInit<
	T extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
>(
	dataPlaceholder: T,
	fallbackData: T,
	dbAdapter: CollectionAppDbAdapter<T, TProjection>,
	dbName: string
): CollectionAppEnvironment<T, TProjection> {
	let store: SmartStore<T, TProjection>;
	let contextManager = createCollectionAppContextManager();

	let storeOptions = generateStoreOptions(contextManager.appContext, fallbackData);
	let permaRepo = new CollectionAppPermanentRepo<T, TProjection>(dbName, dbAdapter);
	let repo = new CollectionAppContextualRepo(permaRepo, dbName, dbAdapter);

	store = new SmartStore<T, TProjection>(
		contextManager.appContext,
		dataPlaceholder,
		repo,
		dbAdapter,
		storeOptions
	);

	let dataStateManager = new DataStateManager(store, contextManager);

	console.log('Collection App Initiated. Context:', $state.snapshot(contextManager.appContext));

	async function deleteInternal(context: CollectionAppContext): Promise<CollectionAppBlankResult> {
		try {
			let ret;
			ret = await store.delete(context);

			if (ret.ok) {
				console.log('Successfully Deleted Record. [', ret.value.key, ']. Rerouting...');

				if (contextManager.appContext.editMode === 'permanent') {
					contextManager.replaceContext(context, '');
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
				error: {
					kind: 'General Error',
					message: getErrorMessage(e),
					context
				}
			};
		}
	}

	let ret: CollectionAppEnvironment<T, TProjection> = {
		destroy: $effect.root(() => {
			$effect(() => {
				let ctxChangeEvent = contextManager.appContextChangeEvent;
				track(ctxChangeEvent);

				untrack(() => {
					if (!ctxChangeEvent) return;
					if (
						ctxChangeEvent.kind === 'browser-navigation' &&
						ctxChangeEvent.prevContext.slug !== ctxChangeEvent.newContext.slug
					) {
						console.log(
							'context change due to browser-navigation, reloading store. - new context',
							$state.snapshot(ctxChangeEvent.newContext),
							'prevContext',
							$state.snapshot(ctxChangeEvent.prevContext)
						);

						store.reload(
							contextManager.appContext,
							undefined,
							generateStoreOptions(contextManager.appContext, fallbackData)
						);
					}
				});
			});

			$effect(() => {
				track(dataStateManager.currentDataState);

				untrack(() => {
					if (dataStateManager.currentDataState?.kind === 'record-not-found') {
						console.log('slug Key not found - Rerouting to "/"');
						contextManager.changeContext('');
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
		get currentDataState() {
			// TODO AZ clean this up, maybe add another state kind.
			return (
				dataStateManager.currentDataState ?? {
					slug: contextManager.appContext.slug,
					displayName: store.displayName,
					kind: 'loading',
					context: $state.snapshot(contextManager.appContext)
				}
			);
		},
		get dataStates() {
			return dataStateManager.dataStates;
		},
		get projectedContext() {
			// TODO AZ clean this up, maybe add another state kind.
			return contextManager.projectedContext;
		},
		get projectedDataState() {
			// TODO AZ clean this up, maybe add another state kind.
			return dataStateManager.projectedDataState;
		},
		get editMode() {
			return contextManager.appContext.editMode;
		},
		get slug() {
			return contextManager.appContext.slug;
		},
		get displayName() {
			return store.displayName;
		},
		get allRecordProjections() {
			return store.allRecordProjections;
		},
		get _internal() {
			return {
				store
			};
		},
		get baseUrlPath() {
			return contextManager.baseUrlPath;
		},
		renameByProjection: async (
			recordProjection: CollectionAppRecordProjection<T, TProjection>,
			newItemName: string
		) => {
			let res = store.rename(recordId, newItemValue);

			return res;
		},
		save: async () => {
			let res = await store.save();

			if (res.ok) {
				let resValue = res.value;

				console.log(
					'Save return. ',
					'result kind:',
					resValue.kind,
					'res context:',
					resValue.context,
					'currentContext:',
					$state.snapshot(contextManager.appContext)
				);

				if (
					resValue.kind === 'update-with-key-change' &&
					ctxEquals(res.value.context, contextManager.appContext)
				) {
					console.log(
						'keychange changeContext new slug:',
						resValue.newSlug,
						'old slug:',
						resValue.prevSlug
					);

					contextManager.replaceContext(resValue.context, resValue.newSlug);
				}
			} else {
				console.error('Error at saving data:', res.error);
			}

			return res as CollectionAppBlankResult;
		},
		saveAs: async (newItemName: string) => {
			let ctxSnapshot = $state.snapshot(contextManager.appContext);
			try {
				let res = await store.saveAs(contextManager.appContext, newItemName);

				if (res.ok) {
					if (res.value.kind === 'update-with-key-change' || res.value.kind === 'create') {
						if (res.value.kind === 'create') {
							console.log('keychange Create changeContext new key:', res.value.newSlug);
							contextManager.changeContext(res.value.newSlug, res.value.newDisplayName);
						} else {
							console.log(
								'keychange ReplaceKey changeContext new key:',
								res.value.newSlug,
								'old key:',
								res.value.prevSlug ?? 'NoKeyInCreate'
							);
							contextManager.replaceContext(
								res.value.context,
								res.value.newSlug,
								res.value.newDisplayName
							);
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
			return deleteInternal(contextSnapshot);
		},
		deleteByProjection: async (recordProjection: CollectionAppRecordProjection<T, TProjection>) => {
			let context: CollectionAppContext = {
				slug: recordProjection.slug,
				editMode: 'permanent',
				displayName: recordProjection.projection.displayName
			};
			return deleteInternal(context);
		}
	};

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
