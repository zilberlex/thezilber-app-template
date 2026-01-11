import { stampAppRecord, stampSyncableData } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { AutoSaver } from './AutoSaver.svelte';

type RecordManagerWorkState = 'saving' | 'ready';

export class RecordManager<T> implements RecordManager<T> {
	dataReady: boolean = false;
	recordData: T;

	workingSate: RecordManagerWorkState;

	#record: AppRecord<T>;
	#recordStore: RecordStore<T>;
	#autoSaver: AutoSaver<AppRecord<T>> | undefined;

	constructor(record: AppRecord<T>, recordStore: RecordStore<T>) {
		this.#record = $state(record);

		this.#resetAutoSaver();

		this.recordData = $derived(this.#record.data);
		this.#recordStore = recordStore;
		this.workingSate = $state('ready');
	}

	#saveInstances = 0;
	async save() {
		stampAppRecord(getDeviceId(), this.#record.meta);

		const recordSnapshot = snapshotData(this.#record);

		this.#saveInstances++;
		this.workingSate = 'saving';

		await this.#recordStore.update(recordSnapshot as AppRecord<T>);

		this.#saveInstances--;
		if (this.#saveInstances === 0) this.workingSate = 'ready';
	}

	async saveAs(recordKey: string): Promise<void> {
		const recordSnapshot = snapshotData(this.#record);
		const newRecord = await this.#recordStore.create(recordKey, recordSnapshot.data as T);

		this.#record = newRecord;
	}

	load(record: AppRecord<T>) {
		this.#record = record;
		this.#resetAutoSaver();
	}

	#resetAutoSaver() {
		this.#autoSaver?.destroy();
		this.#autoSaver = new AutoSaver(this.#record, () => this.save());
	}
}

function snapshotData<T>(state: T) {
	const snapshot = $state.snapshot(state);
	return structuredClone(snapshot) as unknown as T;
}
