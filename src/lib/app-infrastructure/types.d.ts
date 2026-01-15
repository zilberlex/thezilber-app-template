import type { RecordManager } from "./record-manager.svelte";

 type EditMode = 'permanent' | 'draft';

 type CollectionAppRuntime<T> = {
   recordManager: RecordManager<T>;
 }

type CollectionAppContext = {
	editMode: EditMode;
	itemKey?: string;
}

 type CollectionAppEnvironment<T> = CollectionAppContext &{
  runtime: CollectionAppRuntime<T>;
 }

interface RecordStore<TData> {
	async update(record: AppRecord<TData>);

	async create(recordKey: string, data: TData ): Promise<AppRecord<TData>>;
	async load(itemKey): Promise<AppRecord<TData> | undefined>;
}
