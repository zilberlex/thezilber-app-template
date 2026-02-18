type EditMode = 'permanent' | 'draft';
type ItemKey = '_draft' | string;

type SyncableAppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};

type CollectionAppRecord<TData> = AppRecord<TData, SyncableAppRecordMetadata>;

type CollectionAppRuntime<T> = {
	get data(): T;
	dataState: AppDataState;
	save(): Promise<CollectionAppActionResult<void>>;
	saveAs(itemKey: string): Promise<CollectionAppActionResult<void>>;
	delete(): Promise<CollectionAppActionResult<void>>;
};

type CollectionAppContext = {
	editMode: EditMode;
	itemKey: string;
};

type CollectionAppRecordAdapter<TData, TMeta> = {
	constructRecord(data: TData): AppRecord<TData, TMeta>;
	constructDbRecord(data: TData): DbAppRecord<TData, TMeta>;
	fromDb: (dbRecord: DbAppRecord<TData, TMeta>) => AppRecord<TData, TMeta>;
	toDb: (AppRecord: AppRecord<TData, TMeta>) => DbAppRecord<TData, TMeta>;
};

// todo az move one layer type
// If value not found it is undefined rather than error
type Ok<T> = T extends void ? { ok: true } : { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type ActionResult<T, E> = Ok<T> | Err<E>;
interface AppRecordRepo<TData, TMeta, TError> {
	update(
		context: CollectionAppContext,
		record: DbAppRecord<TData, TMeta>
	): Promise<ActionResult<void, TError>>;

	create(
		context: CollectionAppContext,
		data: TData
	): Promise<ActionResult<DbAppRecord<TData, TMeta>, TError>>;
	load(
		context: CollectionAppContext
	): Promise<ActionResult<DbAppRecord<TData, TMeta> | undefined, TError>>;
	delete(
		context: CollectionAppContext,
		record: DbAppRecord<TData, TMeta>
	): Promise<ActionResult<void, TError>>;
}

type AppDataState = 'saving' | 'ready' | 'loading' | 'record-not-found' | 'error';

type CollectionAppEnvironment<T> = CollectionAppContext & CollectionAppRuntime<T>;

type DataManagerOptions<T> = {
	loadNotFoundBehavior: 'error' | 'create-new';
	loadNotFoundNewObject?: () => T;
};

type CollectionAppError = { kind: 'Key Already Exists' | 'General Error'; message: string };
type CollectionAppActionResult<T> = ActionResult<T | undefined, CollectionAppError>;
