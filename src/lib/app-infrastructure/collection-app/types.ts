type EditMode = 'permanent' | 'draft';

type SyncableAppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};

type CollectionAppRecord<TData> = AppRecord<TData, SyncableAppRecordMetadata>;

type CollectionAppRuntimeTemp<T> = {
	data: T;
	dataState: AppDataState;
	save(): Promise<void>;
	saveAs(itemKey: string): Promise<void>;
	delete(): Promise<void>;
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

interface AppRecordRepo<TData, TMeta> {
	update(context: CollectionAppContext, record: DbAppRecord<TData, TMeta>): Promise<void>;

	create(context: CollectionAppContext, data: TData): Promise<DbAppRecord<TData, TMeta>>;
	load(context: CollectionAppContext): Promise<DbAppRecord<TData, TMeta> | undefined>;
	delete(context: CollectionAppContext, record: DbAppRecord<TData, TMeta>): Promise<void>;
}

type AppDataState = 'saving' | 'ready' | 'loading' | 'record-not-found' | 'error';

type CollectionAppEnvironmentTemp<T> = CollectionAppContext & CollectionAppRuntimeTemp<T>;

type DataManagerOptions<T> = {
	loadNotFoundBehavior: 'error' | 'create-new';
	loadNotFoundNewObject?: () => T;
};
