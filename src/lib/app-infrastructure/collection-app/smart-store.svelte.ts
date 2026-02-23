import { browser } from '$app/environment';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { Value } from 'sass';
import { deepAssign } from '../deep-assign';
import { stampAppRecord } from './data';
import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';
import { Cache } from './cache';
import { error } from '@sveltejs/kit';

export type SmartStoreOptions<T> = {
	loadNotFoundBehavior: { action: 'error' } | { action: 'create-new'; createObj: () => T };
};

const defaultOptions: SmartStoreOptions<any> = {
	loadNotFoundBehavior: { action: 'error' }
};

// TODO AZ think of a better name and placement;
type RecordI<T> = AppRecord<T, SyncableAppRecordMetadata>;

export class SmartStore<T> {
	#context: CollectionAppContext;
	#record: RecordI<T>;
	#dataState: AppDataState;
	#recordAdapter: CollectionAppRecordAdapter<T, SyncableAppRecordMetadata>;
	#options: SmartStoreOptions<T>;
	#repository: AppRecordRepo<T, SyncableAppRecordMetadata, CollectionAppError>;
	#cache: Cache<string, RecordI<T>>;

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
		this.#cache = new Cache();

		this.#record = $state(this.#recordAdapter.constructRecord(placeHolderValue));
		this.#dataState = $state({ kind: 'loading', key: this.#context.itemKey });
		this.#repository = repository;

		if (browser) {
			this.reload(context, placeHolderValue, options);
		}
	}

	async save(): Promise<StoreSaveActionResult> {
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record) as AppRecord<T, SyncableAppRecordMetadata>;

		this.#dataState = { kind: 'saving', key: saveData.key };
		let res = await this.#repository.update(this.#context, saveData);

		if (res.ok) {
			let prevItemKey = this.#context.itemKey;
			let newItemKey = this.#record.key;

			this.#cache.setOrUpdateKey(newItemKey, saveData, prevItemKey);
			this.#dataState = { kind: 'ready', key: newItemKey };

			if (prevItemKey !== newItemKey) {
				return {
					ok: true,
					value: {
						kind: 'update-with-key-change',
						prevItemKey: prevItemKey,
						newItemKey: newItemKey
					}
				};
			}
			return { ok: true, value: { kind: 'update' } };
		} else {
			this.#dataState = { kind: 'error' };
			return { ok: false, error: res.error };
		}
	}

	async saveAs(context: CollectionAppContext, newItemKey: string): Promise<StoreSaveActionResult> {
		let prevItemKey = this.#record.key;

		this.#record.key = newItemKey;

		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#dataState = { kind: 'saving', key: this.#record.key };

		console.log('Creating New Data', saveData);
		let res = await this.#repository.create(context, saveData);

		if (res.ok) {
			this.#record = this.#recordAdapter.fromDb(res.value);
			this.#cache.setOrUpdateKey(newItemKey, this.#record);

			this.#dataState = { kind: 'ready', key: newItemKey };

			return { ok: true, value: { kind: 'create', newItemKey: newItemKey } };
		} else {
			this.#dataState = { kind: 'error' };
			this.#record.key = prevItemKey;
			return { ok: false, error: res.error };
		}
	}

	async delete(context: CollectionAppContext): Promise<CollectionAppBlankResult> {
		let res = await this.#repository.delete(context, this.#record);

		if (res.ok) {
			this.#cache.delete(this.#record.key);
			return { ok: true, value: undefined };
		} else {
			return res;
		}
	}

	async reload(
		context: CollectionAppContext,
		placeHolderValue?: T,
		options?: SmartStoreOptions<T>
	) {
		this.#context = context;

		if (options) {
			this.#options = options;
		}

		if (context.itemKey === this.#record.key) return;

		this.#dataState = { kind: 'loading', key: context.itemKey };
		if (placeHolderValue) {
			this.#record = this.#recordAdapter.constructRecord(placeHolderValue);
		}

		let loadResult = await this.#getItemWithCaching(this.#context);

		if (!loadResult.ok) {
			this.#dataState = { kind: 'error' };
			console.error('Store Load Data Failed', loadResult.error);

			return;
		}

		let record = loadResult.value;
		if (record) {
			deepAssign(this.#record, record);

			// TODO AZ refactor draft handling and normalization of drafts. - this if this shit is even needed
			// - technically not needed or maybe needed on save instead of load. or maybe both
			if (this.#context.editMode === 'draft') this.#record.key = '_draft_';
			this.#dataState = { kind: 'ready', key: this.#record.key };
		} else {
			const notFoundBehvior = this.#options?.loadNotFoundBehavior;
			if (notFoundBehvior?.action === 'create-new') {
				deepAssign(this.#record, this.#recordAdapter.constructRecord(notFoundBehvior.createObj()));
				this.#dataState = { kind: 'ready', key: this.#record.key };
			} else {
				this.#dataState = { kind: 'record-not-found', key: this.#context.itemKey };
			}
		}
	}

	async #getItemWithCaching(
		context: CollectionAppContext
	): Promise<CollectionAppLoadResult<RecordI<T>>> {
		let itemKey = context.itemKey;
		let record = await this.#cache.get(itemKey);

		if (!record) {
			let loadFromRepoResult = await this.#repository.load(context);

			if (!loadFromRepoResult.ok) {
				return { ok: false, error: loadFromRepoResult.error };
			}

			if (loadFromRepoResult.value) {
				record = this.#recordAdapter.fromDb(loadFromRepoResult.value);
				await this.#cache.setOrUpdateKey(itemKey, record);
			}
		}

		return { ok: true, value: record };
	}
}
