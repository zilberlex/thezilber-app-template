import type {
	AllRecordsProjections,
	AppRecord,
	CollectionAppRecordProjection,
	DataProjection,
	SyncableAppRecordMetadata
} from '$lib/app-infrastructure/collection-app/data/types';
import type { SvelteMap } from 'svelte/reactivity';
import type { SmartStore } from './smart-store.svelte';
import type { TouchMap } from './touch-map.svelte';

export type EditMode = 'permanent' | 'draft';
export type ItemKey = '_draft_' | string;

export type CollectionAppRecord<TData, TProjection extends DataProjection> = AppRecord<
	TData,
	TProjection,
	SyncableAppRecordMetadata
>;

export type CollectionAppRuntime<
	T extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
> = {
	get data(): T;
	get dataStates(): SvelteMap<string, AppDataState>;
	get displayName(): string;

	get currentDataState(): AppDataState;
	get projectedDataState(): AppDataState | undefined;
	get projectedContext(): CollectionAppContext | undefined;
	get baseUrlPath(): string;

	get allRecordProjections(): TouchMap<string, CollectionAppRecordProjection<T, TProjection>>;

	renameByProjection(
		recordProjection: CollectionAppRecordProjection<T, TProjection>,
		newName: string
	): Promise<CollectionAppBlankResult>;

	save(): Promise<CollectionAppBlankResult>;
	saveAs(slug: string): Promise<CollectionAppBlankResult>;
	delete(): Promise<CollectionAppBlankResult>;
	destroy(): void;
	deleteByProjection(
		recordProjection: CollectionAppRecordProjection<T, TProjection>
	): Promise<CollectionAppBlankResult>;

	get _internal(): {
		store: SmartStore<T, any>;
	};
};

export type CollectionAppContext = {
	editMode: EditMode;
	slug: string;
	displayName?: string;
};

export type ContextChangeEventKind = 'data-key-update' | 'browser-navigation';

export type CollectionAppContextChangeEvent = {
	kind: ContextChangeEventKind;
	prevContext: CollectionAppContext;
	newContext: CollectionAppContext;
};

export type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	projectedContext: TContext | undefined;
	// Tech Debt
	appContextChangeEvent: CollectionAppContextChangeEvent | undefined;
	changeContext: (slug: string, displayName?: string) => { undoChangeContext: () => void };
	replaceContext: (prevContext: TContext, newSlug: string, newDisplayName?: string) => void;
	changeProjectedContext: (slug: string) => void;
	resetProjectedContext: () => void;
	get baseUrlPath(): string;
};

// todo az move one layer type
// If value not found it is undefined rather than error
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
export type ActionResult<T, E> = Ok<T> | Err<E>;

export type WithOpId<T> = T & { opId: number };

export type AppDataStateOld = 'saving' | 'ready' | 'loading' | 'record-not-found' | 'error';

export type AppDataState = { context: CollectionAppContext } & (
	| {
			kind: 'creating';
			slug: string;
			prevSlug: string;
			displayName: string;
			prevDisplayName: string;
	  }
	| { kind: 'saving'; slug: string; prevSlug: string; displayName: string; prevDisplayName: string }
	| {
			kind: 'loading';
			slug: string;
			prevSlug?: string;
	  }
	| { kind: 'deleting'; slug: string; displayName: string }
	| { kind: 'deleted'; slug: string; displayName: string }
	| {
			kind: 'record-not-found';
			slug: string;
			prevSlug?: string;
	  }
	| {
			kind: 'ready';
			slug: string;
			prevSlug?: string;
			displayName: string;
			prevDisplayName?: string;
	  }
	| { kind: 'error'; slug: string; errorData: CollectionAppError }
);

export type CollectionAppEnvironment<
	T extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
> = CollectionAppContext & CollectionAppRuntime<T, TProjection>;

export type DataManagerOptions<T> = {
	loadNotFoundBehavior: 'error' | 'create-new';
	loadNotFoundNewObject?: () => T;
};

export type CollectionAppError = {
	context: CollectionAppContext;
	kind: 'Key Already Exists' | 'Key Not Found' | 'Corrupted Record' | 'General Error';
	message: string;
};
export type CollectionAppLoadResult<T> = ActionResult<T | undefined, CollectionAppError>;
export type CollectionAppBlankResult = ActionResult<void, CollectionAppError>;

export type StoreSaveResult = { context: CollectionAppContext } & (
	| { kind: 'create'; newSlug: string; newDisplayName: string }
	| {
			kind: 'update-with-key-change';
			prevSlug: string;
			newSlug: string;
			prevDisplayName: string;
			newDisplayName: string;
	  }
	| { kind: 'update' }
	| { kind: 'another-operation-in-progress'; currentOperation: AppDataState }
);

export type StoreDeleteResult = { context: CollectionAppContext } & {
	kind: 'deleted';
	key: string;
};

export type StoreSaveActionResult = ActionResult<StoreSaveResult, CollectionAppError>;
export type StoreDeleteActionResult = ActionResult<StoreDeleteResult, CollectionAppError>;
