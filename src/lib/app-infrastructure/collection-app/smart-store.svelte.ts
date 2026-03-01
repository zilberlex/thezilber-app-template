import { browser } from '$app/environment';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { deepAssign } from '../deep-assign';
import { Cache } from './cache';
import { stampAppRecord } from './data';

export type SmartStoreOptions<T> = {
	loadNotFoundBehavior: { action: 'error' } | { action: 'create-new'; createObj: () => T };
};

const defaultOptions: SmartStoreOptions<any> = {
	loadNotFoundBehavior: { action: 'error' }
};

// TODO AZ think of a better name and placement;
type RecordI<T> = AppRecord<T, SyncableAppRecordMetadata>;

type AbortablePromise<T> = {
	isAborted: boolean;
	promise: Promise<T>;
};

function abortable<T>(p: Promise<T>): { abort: () => void; abortablePromise: AbortablePromise<T> } {
	let isAborted = false;

	return {
		abort: () => (isAborted = true),
		abortablePromise: {
			promise: p,
			get isAborted() {
				return isAborted;
			}
		}
	};
}

export class SmartStore<T> {
	#context: CollectionAppContext;
	#record: RecordI<T>;
	#dataState: AppDataState;

	#recordAdapter: CollectionAppRecordAdapter<T, SyncableAppRecordMetadata>;
	#options: SmartStoreOptions<T>;
	#repository: AppRecordRepo<T, SyncableAppRecordMetadata, CollectionAppError>;
	#cache: Cache<string, RecordI<T>>;

	#reloadAbort: (() => void) | undefined;

	#saveOpCouter = 0;

	get data() {
		return this.#record.data;
	}

	get dataState() {
		return this.#dataState;
	}

	get dataKey() {
		return this.#record?.key;
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
		let contextSnapshot = $state.snapshot(this.#context);
		// TODO AZ unify logic with saveAs
		let dataState = $state.snapshot(this.#dataState);
		if (dataState.kind !== 'ready' && dataState.kind !== 'saving') {
			return {
				ok: true,
				value: { kind: 'another-operation-in-progress', currentOperation: dataState }
			};
		}

		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record) as AppRecord<T, SyncableAppRecordMetadata>;

		let currentSaveOp = ++this.#saveOpCouter;

		let recordSnapshot = $state.snapshot(this.#record);

		this.#dataState = { kind: 'saving', key: saveData.key };
		let res = await this.#repository.update(this.#context, saveData);

		if (res.ok) {
			let prevItemKey = contextSnapshot.itemKey;
			let newItemKey = recordSnapshot.key;

			await this.#cache.setOrUpdateKey(newItemKey, saveData, prevItemKey);

			const dataStateAfterOp = $state.snapshot(this.#dataState) as AppDataState;
			if (
				dataStateAfterOp.kind !== 'loading' &&
				currentSaveOp === this.#saveOpCouter &&
				// this is to check if context have changed since save start to prevent false reporting on context.itemKey
				contextSnapshot.itemKey !== this.#context.itemKey
			) {
				this.#dataState = { kind: 'ready', key: newItemKey };
			}

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
		let dataState = $state.snapshot(this.#dataState);
		if (dataState.kind !== 'ready' && dataState.kind !== 'saving') {
			return {
				ok: true,
				value: { kind: 'another-operation-in-progress', currentOperation: dataState }
			};
		}

		let contextSnapshot = $state.snapshot(context);

		let prevItemKey = this.#record.key;

		this.#record.key = newItemKey;

		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#dataState = { kind: 'saving', key: this.#record.key };
		let currentSaveOp = this.#saveOpCouter++;

		console.log('Creating New Data', saveData);
		let res = await this.#repository.create(context, saveData);

		if (res.ok) {
			let newRecord = this.#recordAdapter.fromDb(res.value);
			await this.#cache.setOrUpdateKey(newItemKey, newRecord);

			if (contextSnapshot.itemKey === this.#context.itemKey) {
				// this check is to prevent changing of working record during context changes
				this.#record = newRecord;
			}

			const dataStateAfterOp = $state.snapshot(this.#dataState) as AppDataState;
			if (dataStateAfterOp.kind !== 'loading' && currentSaveOp === this.#saveOpCouter) {
				this.#dataState = { kind: 'ready', key: newItemKey };
			}

			return { ok: true, value: { kind: 'create', newItemKey: newItemKey } };
		} else {
			this.#dataState = { kind: 'error' };
			this.#record.key = prevItemKey;

			return { ok: false, error: res.error };
		}
	}

	async delete(context: CollectionAppContext): Promise<CollectionAppBlankResult> {
		// TODO AZ add result here also

		if (this.#dataState.kind !== 'ready') return { ok: true, value: undefined };

		let res = await this.#repository.delete(context, this.#record);

		if (res.ok) {
			await this.#cache.delete(this.#record.key);
			return { ok: true, value: undefined };
		} else {
			return res;
		}
	}

	// TODO AZ Return ReloadResult
	async reload(
		newContext: CollectionAppContext,
		placeHolderValue?: T,
		options?: SmartStoreOptions<T>
	) {
		let recordSnapshot = $state.snapshot(this.#record);
		let prevContextSnapshot = $state.snapshot(this.#context);
		let prevItemKey = recordSnapshot.key;
		let newContextSnapshot = $state.snapshot(newContext);

		this.#reloadAbort?.();

		this.#context = newContext;

		if (options) {
			this.#options = options;
		}

		// TODO AZ organize this mess
		if (newContextSnapshot.itemKey === prevItemKey) {
			console.log(
				'Store reload canceled - current record key matches new context:',
				newContextSnapshot,
				'prevItemKey',
				prevItemKey,
				'current record',
				$state.snapshot(this.#record)
			);
			return;
		}

		console.log('Store Starting Store Reload. new Context', newContextSnapshot);
		this.#dataState = { kind: 'loading', key: newContext.itemKey };
		if (placeHolderValue) {
			this.#record = this.#recordAdapter.constructRecord(placeHolderValue);
		}

		let { abort, abortablePromise } = abortable(this.#getItemWithCaching(this.#context));
		this.#reloadAbort = abort;

		let loadResult = await abortablePromise.promise;

		if (abortablePromise.isAborted) {
			console.log('Store - Aborted Reload', newContextSnapshot);
			return;
		}

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
