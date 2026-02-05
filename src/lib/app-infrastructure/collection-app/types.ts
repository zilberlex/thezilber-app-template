type EditMode = 'permanent' | 'draft';

type AppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};

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

interface DbAppRecord<T> {
	recordId: string;
	meta: AppRecordMetadata;
	data: T;
}

type AppRecordAdapter<T> = {
	constructRecord(data: T): AppRecord<T>;
	constructDbRecord(data: T): DbAppRecord<T>;
	fromDb: (dbRecord: DbAppRecord<T>) => AppRecord<T>;
	toDb: (AppRecord: AppRecord<T>) => DbAppRecord<T>;
};

interface AppRecordRepo<TData> {
	update(context: CollectionAppContext, record: DbAppRecord<TData>): Promise<void>;

	create(context: CollectionAppContext, data: TData): Promise<DbAppRecord<TData>>;
	load(context: CollectionAppContext): Promise<DbAppRecord<TData> | undefined>;
	delete(context: CollectionAppContext, record: DbAppRecord<TData>): Promise<void>;
}

type AppDataState = 'saving' | 'ready' | 'loading' | 'record-not-found' | 'error';

type CollectionAppEnvironmentTemp<T> = CollectionAppContext & CollectionAppRuntimeTemp<T>;

type DataManagerOptions<T> = {
	loadNotFoundBehavior: 'error' | 'create-new';
	loadNotFoundNewObject?: () => T;
};
