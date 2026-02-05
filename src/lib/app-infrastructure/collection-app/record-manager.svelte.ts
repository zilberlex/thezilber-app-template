// TODO AZ REMOVE

// import { stampAppRecord } from '$lib/engine/storage/data/data';
// import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
// import { untrack } from 'svelte';
// import { AutoSaver } from './AutoSaver.svelte';
// import { AsyncState } from './async-state.svelte';
// import type { MaybeGetter } from 'svelte-toolbelt';
//
// export class RecordManager<T> {
// 	// ===== static singleton handling =====
// 	private static current: RecordManager<any> | undefined;
//
// 	static create<T>(
// 		recordStore: RecordStore<T>,
// 		placeholderData: MaybeGetter<AppRecord<T>>
// 	): RecordManager<T> {
// 		// destroy previous instance
// 		RecordManager.current?.destroy();
//
// 		const instance = new RecordManager(recordStore, placeholderData);
// 		RecordManager.current = instance;
//
// 		return instance;
// 	}
//
// 	// Instance
// 	dataState: AppDataState;
// 	dataReady: boolean;
//
// 	#asyncRecord: AsyncState<AppRecord<T>>;
// 	#record: AppRecord<T>;
// 	#recordStore: RecordStore<T>;
// 	#autoSaver: AutoSaver<AppRecord<T>> | undefined;
//
// 	private constructor(recordStore: RecordStore<T>, placeHolderData: MaybeGetter<AppRecord<T>>) {
// 		this.#recordStore = recordStore;
//
// 		this.#asyncRecord = new AsyncState(placeHolderData);
//
// 		this.#record = this.#asyncRecord.value;
//
// 		this.dataState = $derived(this.#asyncRecord.dataState);
// 		this.dataReady = $derived(this.dataState !== 'loading');
//
// 		this.#resetAutoSaver();
// 	}
//
// 	get recordData() {
// 		return this.#record.data;
// 	}
//
// 	#saveInstances = 0;
// 	async save() {
// 		const record = this.#record;
//
// 		this.#saveInstances++;
// 		this.dataState = 'saving';
//
// 		try {
// 			console.log('recordSnapshot: ', $state.snapshot(record));
//
// 			stampAppRecord(getDeviceId(), record.meta);
// 			const recordSnapshot = snapshotData(record);
//
// 			await this.#recordStore.update(recordSnapshot as AppRecord<T>);
// 		} finally {
// 			this.#saveInstances--;
// 			if (this.#saveInstances === 0) this.dataState = 'ready';
// 		}
// 	}
//
// 	async saveAs(recordKey: string): Promise<void> {
// 		const recordSnapshot = snapshotData(this.#record);
// 		const newRecordPromise = this.#recordStore.create(recordKey, recordSnapshot.data as T);
//
// 		this.#asyncRecord.load(newRecordPromise);
// 	}
//
// 	load(recordKey: string) {
// 		this.#loadInternal(recordKey);
// 	}
//
// 	loadOrDefault(recordKey: string, defaultItem: AppRecord<T>) {
// 		this.#loadInternal(recordKey, defaultItem);
// 	}
//
// 	#loadInternal(recordKey: string, defaultItem?: AppRecord<T>) {
// 		let newRecordPromise = this.#recordStore.load(recordKey);
//
// 		if (defaultItem) newRecordPromise = newRecordPromise.then((record) => record ?? defaultItem);
//
// 		this.#asyncRecord.load(newRecordPromise);
// 		this.#resetAutoSaver();
// 	}
//
// 	#resetAutoSaver() {
// 		this.#autoSaver?.destroy();
// 		this.#autoSaver = new AutoSaver(this.#record, async (_) => {
// 			if (!this.dataReady) return;
// 			this.save();
// 		});
// 	}
//
// 	destroy() {
// 		this.#autoSaver?.destroy();
// 	}
// }
//
// function snapshotData<T>(state: T) {
// 	const snapshot = $state.snapshot(state);
// 	return structuredClone(snapshot) as unknown as T;
// }
