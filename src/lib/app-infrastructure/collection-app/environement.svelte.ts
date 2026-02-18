import { AutoSaver } from '../auto-saver.svelte';
import { createCollectionAppContextManager } from './context-manager.svelte';
import { SmartStore, type SmartStoreOptions } from './smart-store.svelte';

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

	console.log(`loaded collection applicatoin context.`, contextManager.appContext);

	let ret = {
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
			return store.save();
		},
		saveAs: async (newItemKey: string) => {
			let { undoMoveRoute } = contextManager.moveRouteRelative(newItemKey);
			try {
				let ret = await store.saveAs(contextManager.appContext);

				if (!ret.ok) {
					console.log('context before', $state.snapshot(contextManager.appContext));

					undoMoveRoute();
					console.log('context after', $state.snapshot(contextManager.appContext));
				}

				return ret;
			} catch (e) {
				console.error('saveAs Error', e);
			}
		},
		delete: async () => {
			try {
				store.delete(contextManager.appContext);

				if (contextManager.appContext.editMode === 'permanent') {
					contextManager.moveRouteRelative('/');
				}

				store.reload(
					contextManager.appContext,
					dataPlaceholder,
					generateStoreOptions(contextManager.appContext, fallbackData)
				);
			} catch (e) {
				console.error('delete Error', e);
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
