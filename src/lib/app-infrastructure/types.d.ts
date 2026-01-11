 type EditMode = 'permanent' | 'draft';

 interface RecordManager<T> {}

type CollectionAppContext = {
	editMode: EditMode;
	itemKey?: string;
};

interface RecordStore<TData> {
	async update(record: AppRecord<TData>);

	async create(recordKey: string, data: TData ): Promise<AppRecord<TData>>;
	async load(itemKey): Promise<AppRecord<TData> | undefined>;
}
