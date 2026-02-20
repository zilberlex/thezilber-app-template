import { browser } from '$app/environment';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { Value } from 'sass';
import { deepAssign } from '../deep-assign';
import { stampAppRecord } from './data';
import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import { keyBoardFocusNavigatedNode } from '$lib/engine/keyboard-navigation/navigation-utils';

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
			let contextItemKey = this.#context.itemKey;
			let newItemKey = this.#record.key;

			this.#dataState = { kind: 'ready', key: newItemKey };

			if (contextItemKey !== newItemKey) {
				return {
					ok: true,
					value: {
						kind: 'update-with-key-change',
						prevItemKey: contextItemKey,
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

		console.log('record before change key', $state.snapshot(this.#record));

		this.#record.key = newItemKey;
		console.log('record after change key', $state.snapshot(this.#record));
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#dataState = { kind: 'saving', key: this.#record.key };
		console.log('Creating New Data', saveData);
		let res = await this.#repository.create(context, saveData);

		if (res.ok) {
			this.#dataState = { kind: 'ready', key: newItemKey };
			this.#record = this.#recordAdapter.fromDb(res.value);
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

		this.#dataState = { kind: 'loading', key: context.itemKey };

		if (placeHolderValue) {
			this.#record = this.#recordAdapter.constructRecord(placeHolderValue);
		}

		let loadResult = await this.#repository.load(this.#context);

		if (loadResult.ok) {
			if (loadResult.value) {
				deepAssign(this.#record, this.#recordAdapter.fromDb(loadResult.value));

				// TODO AZ refactor draft handling and normalization of drafts. - this if this shit is even needed
				// - technically not needed or maybe needed on save instead of load. or maybe both
				if (this.#context.editMode === 'draft') this.#record.key = '_draft_';

				this.#dataState = { kind: 'ready', key: this.#record.key };
			} else {
				const notFoundBehvior = this.#options?.loadNotFoundBehavior;
				if (notFoundBehvior?.action === 'create-new') {
					deepAssign(
						this.#record,
						this.#recordAdapter.constructRecord(notFoundBehvior.createObj())
					);
					this.#dataState = { kind: 'ready', key: this.#record.key };
				} else {
					this.#dataState = { kind: 'record-not-found', key: this.#context.itemKey };
				}
			}
		} else {
			this.#dataState = { kind: 'error' };
		}
	}
}
