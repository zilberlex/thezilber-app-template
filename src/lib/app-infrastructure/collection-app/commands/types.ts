import type { CollectionAppCache } from '../collectionAppCache.svelte';
import type { DataProjection } from '../data/types';
import type { CollectionAppContext, CollectionAppDataStateDispatcher, CollectionAppRecord, CollectionAppRepo } from '../types';

export type InsertCtx = {
	opId: number;
	prevSlug: string;
	newDisplayName: string;
  prevDisplayName: string;
	collectionAppContextSnapshot: CollectionAppContext;
  recordToSave: CollectionAppRecord<unknown, unknown extends DataProjection>;
  optimisticSlug: string;
  createdRecord?:  CollectionAppRecord<unknown, unknown extends DataProjection>;
  relevantContext: CollectionAppContext
};

export type CollectionAppCommandDeps = {
  collectionAppRepo: CollectionAppRepo<unknown, unknown extends DataProjection>;
  collectionAppCache: CollectionAppCache<unknown, unknown extends DataProjection>;
  setCurrentAppRecord: (record: CollectionAppRecord<unknown, unknown extends DataProjection>) => void;
  dataStateDispatcher: CollectionAppDataStateDispatcher;
  currentAppContext: () => CollectionAppContext;
};


