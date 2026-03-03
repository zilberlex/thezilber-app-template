import { browser } from '$app/environment';
import {
	DispatcherImpl,
	type Dispatcher,
	type DispatchHandler
} from '$lib/engine/patterns/observer';
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

export class SmartStore<T> implements Dispatcher<WithOpId<AppDataState>> {
	#context: CollectionAppContext;
	#record: RecordI<T>;

	#recordAdapter: CollectionAppRecordAdapter<T, SyncableAppRecordMetadata>;
	#options: SmartStoreOptions<T>;
	#repository: AppRecordRepo<T, SyncableAppRecordMetadata, CollectionAppError>;
	#cache: Cache<string, RecordI<T>>;

	#reloadAbort: (() => void) | undefined;

	#dataStateDispatacher = new DispatcherImpl<WithOpId<AppDataState>>();
	#runningOpId = 0;

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
		this.#repository = repository;

		if (browser) {
			this.reload(context, placeHolderValue, options);
		}
	}

	get dataKey() {
		return this.#record.key;
	}

	get data() {
		return this.#record.data;
	}

	register(handler: DispatchHandler<WithOpId<AppDataState>>): void {
		this.#dataStateDispatacher.register(handler);
	}

	unregister(handler: DispatchHandler<WithOpId<AppDataState>>): boolean {
		return this.#dataStateDispatacher.unregister(handler);
	}

	#getOpId(): number {
		return ++this.#runningOpId;
	}

	#signalStateChange(dataState: AppDataState, opId: number) {
		this.#dataStateDispatacher.signal({ ...dataState, opId });
	}

	async save(): Promise<StoreSaveActionResult> {
		let opId = this.#getOpId();
		let contextSnapshot = $state.snapshot(this.#context);

		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record) as AppRecord<T, SyncableAppRecordMetadata>;

		let recordSnapshot = $state.snapshot(this.#record);

		this.#signalStateChange(
			{
				kind: 'saving',
				key: saveData.key,
				prevKey: contextSnapshot.itemKey
			},
			opId
		);

		let res = await this.#repository.update(this.#context, saveData);

		if (res.ok) {
			let prevItemKey = contextSnapshot.itemKey;
			let newItemKey = recordSnapshot.key;

			await this.#cache.setOrUpdateKey(newItemKey, saveData, prevItemKey);

			this.#signalStateChange(
				{
					kind: 'ready',
					key: saveData.key,
					prevKey: prevItemKey
				},
				opId
			);

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
			this.#signalStateChange({ kind: 'error', key: saveData.key }, opId);
			return { ok: false, error: res.error };
		}
	}

	async saveAs(context: CollectionAppContext, newItemKey: string): Promise<StoreSaveActionResult> {
		let opId = this.#getOpId();
		let contextSnapshot = $state.snapshot(context);

		let prevItemKey = this.#record.key;

		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#signalStateChange({ kind: 'create', key: newItemKey, prevKey: prevItemKey }, opId);

		console.log('Creating New Data', saveData);
		let res = await this.#repository.create(context, saveData);

		if (res.ok) {
			let newRecord = this.#recordAdapter.fromDb(res.value);
			await this.#cache.setOrUpdateKey(newItemKey, newRecord);

			if (contextSnapshot.itemKey === this.#context.itemKey) {
				// this check is to prevent changing of working record during context changes
				deepAssign(this.#record, newRecord);
			}

			this.#signalStateChange({ kind: 'ready', key: newItemKey, prevKey: prevItemKey }, opId);

			return { ok: true, value: { kind: 'create', newItemKey: newItemKey } };
		} else {
			this.#signalStateChange({ kind: 'error', key: newItemKey }, opId);
			this.#record.key = prevItemKey;

			return { ok: false, error: res.error };
		}
	}

	async delete(context: CollectionAppContext): Promise<CollectionAppBlankResult> {
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
		let opId = this.#getOpId();

		let recordSnapshot = $state.snapshot(this.#record);
		let prevItemKey = recordSnapshot.key;
		let newContextSnapshot = $state.snapshot(newContext);
		let newItemKey = newContextSnapshot.itemKey;

		this.#reloadAbort?.();

		this.#context = newContext;

		if (options) {
			this.#options = options;
		}

		// TODO AZ organize this mess
		if (newItemKey === prevItemKey) {
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
		this.#signalStateChange({ kind: 'loading', key: newItemKey, prevKey: prevItemKey }, opId);

		if (placeHolderValue) {
			deepAssign(this.#record, this.#recordAdapter.constructRecord(placeHolderValue));
		}

		let { abort, abortablePromise } = abortable(this.#getItemWithCaching(this.#context));
		this.#reloadAbort = abort;

		let loadResult = await abortablePromise.promise;

		if (abortablePromise.isAborted) {
			console.log('Store - Aborted Reload', newContextSnapshot);
			return;
		}

		if (!loadResult.ok) {
			this.#signalStateChange({ kind: 'error', key: newItemKey }, opId);

			return;
		}

		let record = loadResult.value;
		if (record) {
			deepAssign(this.#record, record);
			// TODO AZ refactor draft handling and normalization of drafts. - this if this shit is even needed
			// - technically not needed or maybe needed on save instead of load. or maybe both
			if (this.#context.editMode === 'draft') this.#record.key = '_draft_';
			this.#signalStateChange({ kind: 'ready', key: newItemKey, prevKey: prevItemKey }, opId);
		} else {
			const notFoundBehvior = this.#options?.loadNotFoundBehavior;
			if (notFoundBehvior?.action === 'create-new') {
				deepAssign(this.#record, this.#recordAdapter.constructRecord(notFoundBehvior.createObj()));

				this.#signalStateChange({ kind: 'ready', key: newItemKey, prevKey: prevItemKey }, opId);
			} else {
				console.warn('Sinaling record-not-found', newItemKey);

				this.#signalStateChange(
					{
						kind: 'record-not-found',
						key: newItemKey,
						prevKey: prevItemKey
					},
					opId
				);
			}
		}
	}

	async #getItemWithCaching(
		context: CollectionAppContext
	): Promise<CollectionAppLoadResult<RecordI<T>>> {
		let itemKey = context.itemKey;
		let record = await this.#cache.get(itemKey);
		// todo az remove
		record = undefined;

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
