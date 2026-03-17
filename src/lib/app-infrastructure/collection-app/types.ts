import type {
	AppRecord,
	DbAppRecord,
	SyncableAppRecordMetadata
} from '$lib/engine/storage/data/types';

export type EditMode = 'permanent' | 'draft';
export type ItemKey = '_draft_' | string;

export type CollectionAppRecord<TData> = AppRecord<TData, SyncableAppRecordMetadata>;

export type CollectionAppRuntime<T> = {
	get data(): T;
	currentDataState: AppDataState;
	projectedDataState: AppDataState | undefined;
	save(): Promise<CollectionAppBlankResult>;
	saveAs(itemKey: string): Promise<CollectionAppBlankResult>;
	delete(): Promise<CollectionAppBlankResult>;
	destroy(): void;
};

export type CollectionAppContext = {
	editMode: EditMode;
	itemKey: string;
};

export type CollectionAppContextChangeEvent = {
	kind: 'data-key-update' | 'browser-navigation';
	prevContext: CollectionAppContext;
	newContext: CollectionAppContext;
};

export type CollectionAppRecordAdapter<TData, TMeta> = {
	constructRecord(data: TData): AppRecord<TData, TMeta>;
	constructDbRecord(data: TData): DbAppRecord<TData, TMeta>;
	fromDb: (dbRecord: DbAppRecord<TData, TMeta>) => AppRecord<TData, TMeta>;
	toDb: (AppRecord: AppRecord<TData, TMeta>) => DbAppRecord<TData, TMeta>;
};

export type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	projectedContext: TContext | undefined;
	// Tech Debt
	appContextChangeEvent: CollectionAppContextChangeEvent | undefined;
	changeContext: (itemKey: string) => { undoChangeContext: () => void };
	replaceContext: (prevContext: TContext, newItemKey: string) => void;
	changeProjectedContext: (itemKey: string) => void;
	resetProjectedContext: () => void;
};

// todo az move one layer type
// If value not found it is undefined rather than error
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
export type ActionResult<T, E> = Ok<T> | Err<E>;
export interface AppRecordRepo<TData, TMeta, TError> {
	update(
		context: CollectionAppContext,
		record: DbAppRecord<TData, TMeta>
	): Promise<ActionResult<DbAppRecord<TData, TMeta>, TError>>;

	create(
		context: CollectionAppContext,
		data: TData,
		newItemKey: string
	): Promise<ActionResult<DbAppRecord<TData, TMeta>, TError>>;
	load(
		context: CollectionAppContext
	): Promise<ActionResult<DbAppRecord<TData, TMeta> | undefined, TError>>;
	delete(
		context: CollectionAppContext,
		record: DbAppRecord<TData, TMeta>
	): Promise<ActionResult<void, TError>>;
	getAllRecords(): Promise<ActionResult<AllRecordsInfo<TMeta>, TError>>;
}

export type AllRecordsInfo<TMeta> = Omit<DbAppRecord<any, TMeta>, 'data'>[];

export type WithOpId<T> = T & { opId: number };

export type AppDataStateOld = 'saving' | 'ready' | 'loading' | 'record-not-found' | 'error';

export type AppDataState = { context: CollectionAppContext } & (
	| { kind: 'creating'; key: string; prevKey: string }
	| { kind: 'saving'; key: string; prevKey: string }
	| { kind: 'loading'; key: string; prevKey?: string }
	| { kind: 'deleting'; key: string }
	| { kind: 'deleted'; key: string }
	| { kind: 'record-not-found'; key: string; prevKey?: string }
	| { kind: 'ready'; key: string; prevKey?: string }
	| { kind: 'error'; key: string; errorData: CollectionAppError }
);

export type CollectionAppEnvironment<T> = CollectionAppContext & CollectionAppRuntime<T>;

export type DataManagerOptions<T> = {
	loadNotFoundBehavior: 'error' | 'create-new';
	loadNotFoundNewObject?: () => T;
};

export type CollectionAppError = {
	context: CollectionAppContext;
	kind: 'Key Already Exists' | 'General Error';
	message: string;
};
export type CollectionAppLoadResult<T> = ActionResult<T | undefined, CollectionAppError>;
export type CollectionAppBlankResult = ActionResult<void, CollectionAppError>;

export type StoreSaveResult = { context: CollectionAppContext } & (
	| { kind: 'create'; newItemKey: string }
	| { kind: 'update-with-key-change'; prevItemKey: string; newItemKey: string }
	| { kind: 'update' }
	| { kind: 'another-operation-in-progress'; currentOperation: AppDataState }
);

export type StoreDeleteResult = { context: CollectionAppContext } & {
	kind: 'deleted';
	key: string;
};

export type StoreSaveActionResult = ActionResult<StoreSaveResult, CollectionAppError>;
export type StoreDeleteActionResult = ActionResult<StoreDeleteResult, CollectionAppError>;
