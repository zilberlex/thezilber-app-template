type EditMode = 'permanent' | 'draft';

// type CollectionAppRuntime<T> = {
// 	recordManager: RecordManager<T>;
// };

type CollectionAppRuntimeTemp<T> = {
	data: T;
	dataState: AppDataState;
	save(): Promise<void>;
	saveAs(itemKey: string): Promise<void>;
	delete(): Promise<void>;
	editMode: EditMode;
};

type CollectionAppContext = {
	editMode: EditMode;
	itemKey: string;
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
