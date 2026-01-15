import { stampAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { untrack } from 'svelte';
import { AutoSaver } from './AutoSaver.svelte';
import type { RecordStore } from './types';
import { type AsyncState } from './async-state.svelte';

type RecordManagerDataState = 'saving' | 'ready' | 'loading';

export class RecordManager<T> implements RecordManager<T> {
	// ===== static singleton handling =====
	private static current: RecordManager<any> | undefined;

	static create<T>(
		asyncRecordState: AsyncState<AppRecord<T>>,
		recordStore: RecordStore<T>
	): RecordManager<T> {
		// destroy previous instance
		RecordManager.current?.destroy();

		const instance = new RecordManager(asyncRecordState, recordStore);
		RecordManager.current = instance;

		return instance;
	}

	// Instance
	recordData: T;

	dataState: RecordManagerDataState;
	dataReady: boolean;

	#asyncRecord: AsyncState<AppRecord<T>>;
	#record: AppRecord<T>;
	#recordStore: RecordStore<T>;
	#autoSaver: AutoSaver<AppRecord<T>> | undefined;

	#effectRootDestroy: () => void;

	private constructor(asyncRecord: AsyncState<AppRecord<T>>, recordStore: RecordStore<T>) {
		this.#recordStore = recordStore;
		this.#asyncRecord = asyncRecord;

		this.#record = asyncRecord.value;
		this.recordData = this.#record.data;

		this.dataState = $state('loading');
		this.dataReady = $derived(this.dataState !== 'loading');

		this.#resetAutoSaver();

		// Tracking Loading of record
		this.#effectRootDestroy = $effect.root(() => {
			let dataState = this.#asyncRecord.dataState; // Intentional shallow tracking

			untrack(() => {
				if (dataState === 'ready') {
					this.dataState = 'ready';
				}
			});
		});
	}

	#saveInstances = 0;
	async save() {
		const record = this.#record;
		stampAppRecord(getDeviceId(), record.meta);

		const recordSnapshot = snapshotData(record);

		this.#saveInstances++;
		this.dataState = 'saving';

		await this.#recordStore.update(recordSnapshot as AppRecord<T>);

		this.#saveInstances--;
		if (this.#saveInstances === 0) this.dataState = 'ready';
	}

	async saveAs(recordKey: string): Promise<void> {
		const recordSnapshot = snapshotData(this.#record);
		const newRecordPromise = this.#recordStore.create(recordKey, recordSnapshot.data as T);

		this.#asyncRecord.load(newRecordPromise);
	}

	load(newRecordPromise: Promise<AppRecord<T>>) {
		this.#asyncRecord.load(newRecordPromise);
		this.#resetAutoSaver();
	}

	#resetAutoSaver() {
		this.#autoSaver?.destroy();
		this.#autoSaver = new AutoSaver(this.#record, async (_) => {
			if (!this.dataReady) return;
			this.save();
		});
	}

	destroy() {
		this.#autoSaver?.destroy();
		this.#effectRootDestroy();
	}
}

function snapshotData<T>(state: T) {
	const snapshot = $state.snapshot(state);
	return structuredClone(snapshot) as unknown as T;
}
