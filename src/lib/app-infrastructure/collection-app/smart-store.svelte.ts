import { browser } from '$app/environment';
import { deepAssign } from '$lib/app-infrastructure/async-state.svelte';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { stampAppRecord } from './data';

export type SmartStoreOptions<T> = {
	loadNotFoundBehavior: { action: 'error' } | { action: 'create-new'; createObj: () => T };
};

const defaultOptions: SmartStoreOptions<any> = {
	loadNotFoundBehavior: { action: 'error' }
};

export class SmartStore<T> {
	#context: CollectionAppContext;
	#record: AppRecord<T, SyncableAppRecordMetadata>;
	#dataState: AppDataState;
	#recordAdapter: CollectionAppRecordAdapter<T, SyncableAppRecordMetadata>;
	#options: SmartStoreOptions<T>;
	#repository: AppRecordRepo<T, SyncableAppRecordMetadata, unknown>;

	get data() {
		return this.#record.data;
	}

	get dataState() {
		return this.#dataState;
	}

	constructor(
		context: CollectionAppContext,
		placeHolderValue: T,
		repository: AppRecordRepo<T, SyncableAppRecordMetadata, unknown>,
		recordAdapter: CollectionAppRecordAdapter<T, SyncableAppRecordMetadata>,
		options?: SmartStoreOptions<T>
	) {
		this.#context = context;
		this.#options = options ?? defaultOptions;
		this.#recordAdapter = recordAdapter;

		this.#record = $state(this.#recordAdapter.constructRecord(placeHolderValue));
		this.#dataState = $state('loading');
		this.#repository = repository;

		if (browser) {
			this.reload(context, placeHolderValue, options);
		}
	}

	async save() {
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record) as AppRecord<T, SyncableAppRecordMetadata>;

		this.#dataState = 'saving';
		let p = this.#repository.update(this.#context, saveData);

		p.then(() => {
			this.#dataState = 'ready';
		});

		this.#handleErrorOnOperation(p, 'save');

		return p;
	}

	async saveAs(context: CollectionAppContext) {
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#dataState = 'saving';
		console.log('Creating New Data', saveData);
		let p = this.#repository.create(context, saveData);

		p.then((v) => {
			this.#dataState = 'ready';

			if (v.ok) {
				this.#record.key = context.itemKey;
			}
		});

		this.#handleErrorOnOperation(p, 'saveAs');

		return p;
	}

	async delete(context: CollectionAppContext) {
		this.#repository.delete(context, this.#record);
	}

	async reload(
		context: CollectionAppContext,
		placeHolderValue?: T,
		options?: SmartStoreOptions<T>
	) {
		if (options) {
			this.#options = options;
		}

		this.#dataState = 'loading';

		if (placeHolderValue) {
			this.#record = this.#recordAdapter.constructRecord(placeHolderValue);
		}

		let loadResult = await this.#repository.load(context);

    if (loadResult.ok) {
				deepAssign(this.#record, this.#recordAdapter.fromDb(loadResult.value));
				this.#dataState = 'ready';
    } else {
				const notFoundBehvior = this.#options?.loadNotFoundBehavior;
				if (notFoundBehvior?.action === 'create-new') {
					deepAssign(
						this.#record,
						this.#recordAdapter.constructRecord(notFoundBehvior.createObj())
					);
					this.#dataState = 'ready';
    } else {
					this.#dataState = 'error';
      }

	}

	#handleErrorOnOperation(promise: Promise<any>, strContext: string) {
		promise.catch((e: any) => {
			if (e instanceof Error) {
				console.log(`Error on [${strContext}]`, e);
			} else {
				console.log(`Error on [${strContext}]`);
			}
			this.#dataState = 'error';
		});
	}
}
