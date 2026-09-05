import type { CollectionAppCache } from '../collectionAppCache.svelte';
import type {
	CollectionAppContext,
	CollectionAppContextManager,
	CollectionAppDataStateDispatcher,
	CollectionAppRecord,
	CollectionAppRepo
} from '../types';

export type InsertCtx = {
	opId: number;
	prevSlug: string;
	newDisplayName: string;
	prevDisplayName?: string;
	collectionAppContextSnapshot: CollectionAppContext;
	recordToSave: CollectionAppRecord<unknown, any>;
	optimisticSlug: string;
	createdRecord?: CollectionAppRecord<unknown, any>;
};

export type CollectionAppCommandDeps = {
	collectionAppRepo: CollectionAppRepo<unknown, any>;
	collectionAppCache: CollectionAppCache<unknown, any>;
	setCurrentAppRecord: (record: CollectionAppRecord<unknown, any>) => void;
	dataStateDispatcher: CollectionAppDataStateDispatcher;
	currentAppContext: () => CollectionAppContext;
};
