import type { Page } from '@sveltejs/kit';
import { createCollectionAppContextManager } from './context-manager.svelte';
import { SmartStore, type SmartStoreOptions } from './smart-store.svelte';

export function collectionAppInit<T>(
	page: Page,
	dataPlaceholder: T,
	fallbackData: T,
	recordConverter: AppRecordAdapter<T>,
	repo: AppRecordRepo<T>
): CollectionAppEnvironmentTemp<T> {
	let slugItemKey = page.params.itemKey;
	let itemKey = $state(slugItemKey ?? '_draft_');
	let editMode: EditMode = $state(slugItemKey ? 'permanent' : 'draft');
	let store: SmartStore<T>;
	let contextManager = createCollectionAppContextManager(page);

	let storeOptions = generateStoreOptions(contextManager.appContext, fallbackData);

	store = new SmartStore<T>(
		contextManager.appContext,
		dataPlaceholder,
		repo,
		recordConverter,
		storeOptions
	);

	console.log(`loaded collection applicatoin context.`, contextManager.appContext);

	return {
		get data() {
			return store.data;
		},
		get dataState() {
			return store.dataState;
		},
		get editMode() {
			return editMode;
		},
		get itemKey() {
			return itemKey;
		},
		save: async () => {
			store.save();
		},
		saveAs: async (newItemKey: string) => {
			let { undoMoveRoute } = contextManager.moveRouteRelative(newItemKey);
			try {
				await store.saveAs(contextManager.appContext);
			} catch (e) {
				undoMoveRoute();
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
