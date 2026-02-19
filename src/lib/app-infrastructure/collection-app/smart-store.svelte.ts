import { browser } from '$app/environment';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { Value } from 'sass';
import { deepAssign } from '../deep-assign';
import { stampAppRecord } from './data';
import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';

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
	#repository: AppRecordRepo<T, SyncableAppRecordMetadata, CollectionAppError>;

	get data() {
		return this.#record.data;
	}

	get dataState() {
		return this.#dataState;
	}

	constructor(
		context: CollectionAppContext,
		placeHolderValue: T,
		repository: AppRecordRepo<T, SyncableAppRecordMetadata, CollectionAppError>,
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

	async save(): Promise<StoreSaveActionResult> {
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record) as AppRecord<T, SyncableAppRecordMetadata>;

		this.#dataState = 'saving';
		let p = this.#repository.update(this.#context, saveData);

		try {
			let v = await p;

			if (v.ok) {
				// TODO AZ add dirty flag and track key changes from data
				this.#dataState = 'ready';
				return { ok: true, value: { kind: 'update' } };
			} else {
				this.#dataState = 'error';
				return { ok: false, error: v.error };
			}
		} catch (e) {
			this.#handleErrorOnOperation(e, 'saveAs');
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
		}
	}

	async saveAs(context: CollectionAppContext, newItemKey: string): Promise<StoreSaveActionResult> {
		let prevItemKey = this.#record.key;

		console.log('record before change key', $state.snapshot(this.#record));

		this.#record.key = newItemKey;
		console.log('record after change key', $state.snapshot(this.#record));
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#dataState = 'saving';
		console.log('Creating New Data', saveData);
		let p = this.#repository.create(context, saveData);

		try {
			let v = await p;

			if (v.ok) {
				this.#dataState = 'ready';
				this.#record = this.#recordAdapter.fromDb(v.value);
				return { ok: true, value: { kind: 'create', newItemKey: newItemKey } };
			} else {
				this.#dataState = 'error';
				this.#record.key = prevItemKey;
				return { ok: false, error: v.error };
			}
		} catch (e) {
			// TODO AZ REMOVE THOSE TRY CATCHES.
			this.#handleErrorOnOperation(e, 'saveAs');
			this.#dataState = 'error';
			this.#record.key = prevItemKey;
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
		}
	}

	async delete(context: CollectionAppContext): Promise<CollectionAppBlankResult> {
		try {
			await this.#repository.delete(context, this.#record);
			return { ok: true, value: undefined };
		} catch (e) {
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
		}
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

		if (loadResult.ok && loadResult.value) {
			if (loadResult.value) {
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
		} else {
		}
	}

	#handleErrorOnOperation(e: unknown, strContext: string) {
		if (e instanceof Error) {
			console.log(`Error on [${strContext}]`, e);
		} else {
			console.log(`Error on [${strContext}]`);
		}
	}
}
