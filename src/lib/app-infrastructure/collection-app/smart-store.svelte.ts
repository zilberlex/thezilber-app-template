import { browser } from '$app/environment';
import {
	DispatcherImpl,
	type Dispatcher,
	type DispatchHandler
} from '$lib/engine/patterns/observer';
import type {
	AllRecordsProjections,
	AppRecord,
	AppRecordRepo,
	DataProjection,
	DbAdapter,
	RecordProjection,
	SyncableAppRecordMetadata
} from '$lib/app-infrastructure/collection-app/data/types';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { Cache } from './cache';
import { stampAppRecord } from './data';
import type {
	AppDataState,
	CollectionAppContext,
	CollectionAppError,
	CollectionAppLoadResult,
	StoreDeleteActionResult,
	StoreSaveActionResult,
	WithOpId
} from './types';
import { SvelteMap } from 'svelte/reactivity';
import { TouchMap } from './touch-map.svelte';

type SaveOperationsParams =
	| {
			kind: 'update';
			context: CollectionAppContext;
	  }
	| {
			kind: 'create';
			context: CollectionAppContext;
			newItemDisplayName: string;
	  };

export type SmartStoreOptions<T> = {
	loadNotFoundBehavior: { action: 'error' } | { action: 'create-new'; createObj: () => T };
};

// TODO AZ think of a better name and placement;
type RecordI<T, TProjection extends DataProjection> = AppRecord<
	T,
	TProjection,
	SyncableAppRecordMetadata
>;

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

export class SmartStore<T, TProjection extends DataProjection>
	implements Dispatcher<WithOpId<AppDataState>>
{
	#context: CollectionAppContext;
	#record: RecordI<T, TProjection>;
	#recordProjections: TouchMap<string, RecordProjection<T, TProjection, SyncableAppRecordMetadata>>;

	#dbAdapter: DbAdapter<T, TProjection, SyncableAppRecordMetadata>;
	#repository: AppRecordRepo<T, TProjection, SyncableAppRecordMetadata, CollectionAppError>;
	#cache: Cache<string, RecordI<T, TProjection>>;

	#reloadAbort: (() => void) | undefined;

	#dataStateDispatacher = new DispatcherImpl<WithOpId<AppDataState>>();
	#runningOpId = 0;

	constructor(
		context: CollectionAppContext,
		placeHolderValue: T,
		repository: AppRecordRepo<T, TProjection, SyncableAppRecordMetadata, CollectionAppError>,
		dbAdapter: DbAdapter<T, TProjection, SyncableAppRecordMetadata>,
		options?: SmartStoreOptions<T>
	) {
		this.#context = context;
		this.#cache = new Cache();

		this.#dbAdapter = dbAdapter;
		this.#record = $state(this.#dbAdapter.constructRecord(placeHolderValue));
		this.#recordProjections = $state(new TouchMap('prepend'));
		this.#repository = repository;

		// TODO AZ - create repo here instead of injection, or find a better way for testing also.
		if (browser) {
			this.reload(context, placeHolderValue, options);

			this.#initeRecordProjections();
		}
	}

	async #initeRecordProjections() {
		let recordPrjectionsActionResult = await this.#repository.getAllRecordProjections();

		if (recordPrjectionsActionResult.ok) {
			let recordProjectionsFromRepo = recordPrjectionsActionResult.value;
			recordProjectionsFromRepo.forEach((p) => {
				this.#recordProjections.set(p.recordId, p);
			});
		}
	}

	get slug() {
		// todo az normalize
		return this.#record.slug ? this.#record.slug : '_draft_';
	}

	get data() {
		return this.#record.data;
	}

	get displayName() {
		return this.#record.projection?.displayName;
	}

	get allRecordProjections() {
		return this.#recordProjections;
	}

	register(handler: DispatchHandler<WithOpId<AppDataState>>): void {
		this.#dataStateDispatacher.register(handler);
	}

	unregister(handler: DispatchHandler<WithOpId<AppDataState>>): boolean {
		return this.#dataStateDispatacher.unregister(handler);
	}

	#nextOpId(): number {
		return ++this.#runningOpId;
	}

	#signalStateChange(dataState: AppDataState, opId: number) {
		this.#dataStateDispatacher.signal({ ...dataState, opId });
	}

	async #saveOperations(saveOperationsParams: SaveOperationsParams) {
		const { kind: operation, context } = saveOperationsParams;
		let opId = this.#nextOpId();

		let contextSnapshot = $state.snapshot(context);

		console.log('saveOperations - operation', operation, 'record:', $state.snapshot(this.#record));

		stampAppRecord(getDeviceId(), this.#record.meta);
		this.#dbAdapter.refreshProjection(this.#record);

		let saveRecord = $state.snapshot(this.#record) as RecordI<T, TProjection>;

		let prevItemSlug = contextSnapshot.slug;
		let prevItemDisplayName = contextSnapshot.displayName;

		let newItemDisplayName =
			operation === 'update'
				? saveRecord.projection.displayName
				: saveOperationsParams.newItemDisplayName;

		let slug = saveRecord.slug;
		if (newItemDisplayName !== prevItemDisplayName) {
			console.log('Requesting new slug for displayName', newItemDisplayName);
			slug = await this.#repository.getSlug(newItemDisplayName, saveRecord.slug);
			console.log('Generated Slug for displayName', newItemDisplayName, 'slug:', slug);
		}

		let signalKind: 'saving' | 'creating';
		switch (operation) {
			case 'update':
				signalKind = 'saving';

				break;
			case 'create':
				signalKind = 'creating';
		}

		if (operation === 'update') {
			console.log(`Saving Data...`, saveRecord.data);
		} else {
			console.log(`Creating Data...`, saveRecord.data);
		}

		this.#signalStateChange(
			{
				context: contextSnapshot,
				kind: signalKind,
				slug: slug,
				prevSlug: prevItemSlug,
				displayName: newItemDisplayName,
				prevDisplayName: prevItemDisplayName ?? ''
			},
			opId
		);

		let res;
		if (operation === 'update') {
			console.log('update record context:', contextSnapshot, '\nrecord:', saveRecord);
			saveRecord.slug = slug;
			res = await this.#repository.update(contextSnapshot, saveRecord);
		} else {
			let saveData = saveRecord.data as T;
			console.log(
				'create record. slug:',
				slug,
				'displayName:',
				newItemDisplayName,
				'context:',
				contextSnapshot
			);

			res = await this.#repository.create(contextSnapshot, saveData, newItemDisplayName, slug);
		}

		return {
			repoOpResult: res,
			opId,
			slug,
			displayName: newItemDisplayName,
			prevDisplayName: prevItemDisplayName,
			prevSlug: prevItemSlug,
			contextSnapshot
		};
	}

	async save(): Promise<StoreSaveActionResult> {
		let {
			repoOpResult: res,
			opId,
			slug,
			prevSlug,
			displayName,
			prevDisplayName,
			contextSnapshot
		} = await this.#saveOperations({ context: this.#context, kind: 'update' });

		if (res.ok) {
			let record = res.value;
			await this.#cache.setOrUpdateKey(slug, record, prevSlug);
			let { data, ...rest } = record;
			let recordProjection = rest;
			this.#recordProjections.set(record.recordId, recordProjection);

			this.#signalStateChange(
				{
					context: contextSnapshot,
					kind: 'ready',
					slug,
					prevSlug,
					displayName,
					prevDisplayName
				},
				opId
			);

			if (slug !== prevSlug) {
				return {
					ok: true,
					value: {
						kind: 'update-with-key-change',
						newSlug: slug,
						prevSlug,
						newDisplayName: displayName,
						prevDisplayName: prevDisplayName ?? '',
						context: contextSnapshot
					}
				};
			}

			return { ok: true, value: { kind: 'update', context: contextSnapshot } };
		} else {
			// TODO AZ newItemKey here is potential for issues.
			this.#signalStateChange(
				{ kind: 'error', slug, context: contextSnapshot, errorData: res.error },
				opId
			);
			return { ok: false, error: res.error };
		}
	}

	async saveAs(
		context: CollectionAppContext,
		newItemDisplayName: string
	): Promise<StoreSaveActionResult> {
		let {
			repoOpResult: res,
			opId,
			slug,
			prevSlug,
			displayName,
			prevDisplayName,
			contextSnapshot
		} = await this.#saveOperations({
			context,
			kind: 'create',
			newItemDisplayName: newItemDisplayName
		});

		if (res.ok) {
			//TODO AZ make post save record operations so not code dupe with save
			let newRecord = res.value;
			await this.#cache.setOrUpdateKey(slug, newRecord, prevSlug);
			let { data, ...rest } = newRecord;
			let recordProjection = rest;
			this.#recordProjections.set(newRecord.recordId, recordProjection);

			if (contextSnapshot.slug === this.#context.slug) {
				// this check is to prevent changing of working record during context changes
				this.#record = newRecord;
			}

			this.#signalStateChange(
				{
					kind: 'ready',
					context: contextSnapshot,
					slug,
					prevSlug: prevSlug,
					displayName,
					prevDisplayName
				},
				opId
			);

			return {
				ok: true,
				value: {
					kind: 'create',
					newSlug: slug,
					context: contextSnapshot,
					newDisplayName: displayName
				}
			};
		} else {
			this.#signalStateChange(
				{
					kind: 'error',

					slug,
					context: contextSnapshot,
					errorData: res.error
				},
				opId
			);

			return { ok: false, error: res.error };
		}
	}

	async delete(context: CollectionAppContext): Promise<StoreDeleteActionResult> {
		let opId = this.#nextOpId();
		let ctxSnapshot = $state.snapshot(context);

		// This display name may be wrong udner some conditions, but in general it is good enough
		let displayName = this.#record.projection.displayName;
		this.#signalStateChange(
			{
				kind: 'deleting',
				slug: ctxSnapshot.slug,
				displayName: displayName,
				context: ctxSnapshot
			},
			opId
		);
		console.log('deleting item', ctxSnapshot);

		this.#recordProjections.delete(this.#record.recordId);
		let res = await this.#repository.delete(ctxSnapshot, this.#record);

		if (res.ok) {
			await this.#cache.delete(this.#record.slug);
			this.#signalStateChange(
				{
					kind: 'deleted',
					slug: ctxSnapshot.slug,
					displayName: displayName,
					context: ctxSnapshot
				},
				opId
			);
			return {
				ok: true,
				value: { kind: 'deleted', key: ctxSnapshot.slug, context: ctxSnapshot }
			};
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
		let opId = this.#nextOpId();

		let recordSnapshot = $state.snapshot(this.#record);
		let prevSlug = recordSnapshot.slug;
		let prevDisplayName = recordSnapshot.projection.displayName;
		let newContextSnapshot = $state.snapshot(newContext);
		let newSlug = newContextSnapshot.slug;

		this.#reloadAbort?.();

		this.#context = newContext;

		// TODO AZ organize this mess
		if (newSlug === prevSlug) {
			console.log(
				'Store reload canceled - current record key matches new context:',
				newContextSnapshot,
				'prevItemKey',
				prevSlug,
				'current record',
				$state.snapshot(this.#record)
			);
			return;
		}

		console.log('Store Starting Store Reload. new Context', newContextSnapshot);
		this.#signalStateChange(
			{
				kind: 'loading',
				slug: newSlug,
				context: newContextSnapshot
			},
			opId
		);

		if (placeHolderValue) {
			this.#record = this.#dbAdapter.constructRecord(placeHolderValue);
			console.log('constructRecord', this.#record);
		}

		let { abort, abortablePromise } = abortable(this.#getItemWithCaching(newContextSnapshot));
		this.#reloadAbort = abort;

		let loadResult = await abortablePromise.promise;

		if (abortablePromise.isAborted) {
			console.log('Store - Aborted Reload', newContextSnapshot);
			return;
		}

		if (!loadResult.ok) {
			this.#signalStateChange(
				{
					kind: 'error',
					slug: newSlug,
					context: newContextSnapshot,
					errorData: loadResult.error
				},
				opId
			);

			return;
		}

		let record = loadResult.value;
		if (record) {
			this.#dbAdapter.refreshProjection(record);
			this.#record = record;
			// TODO AZ refactor draft handling and normalization of drafts. - this if this shit is even needed
			// - technically not needed or maybe needed on save instead of load. or maybe both
			this.#signalStateChange(
				{
					kind: 'ready',
					slug: newSlug,
					prevSlug: prevSlug,
					displayName: record.projection.displayName,
					prevDisplayName: prevDisplayName,
					context: newContextSnapshot
				},
				opId
			);
		} else {
			const notFoundBehvior = options?.loadNotFoundBehavior;
			if (notFoundBehvior?.action === 'create-new') {
				this.#record = this.#dbAdapter.constructRecord(notFoundBehvior.createObj());

				this.#signalStateChange(
					{
						kind: 'ready',
						slug: newSlug,
						prevSlug: prevSlug,
						displayName: this.#record.projection.displayName,
						prevDisplayName: prevDisplayName,
						context: newContextSnapshot
					},
					opId
				);
			} else {
				console.warn('Signaling record-not-found', newSlug);

				this.#signalStateChange(
					{
						kind: 'record-not-found',
						slug: newSlug,
						prevSlug: prevSlug,
						context: newContextSnapshot
					},
					opId
				);
			}
		}
	}

	async #getItemWithCaching(
		context: CollectionAppContext
	): Promise<CollectionAppLoadResult<RecordI<T, TProjection>>> {
		let itemKey = context.slug;
		let record = await this.#cache.get(itemKey);

		if (!record) {
			let loadFromRepoResult = await this.#repository.load(context);

			if (!loadFromRepoResult.ok) {
				return { ok: false, error: loadFromRepoResult.error };
			}

			if (loadFromRepoResult.value) {
				record = loadFromRepoResult.value;
				await this.#cache.setOrUpdateKey(itemKey, record as RecordI<T, TProjection>);
			}
		}

		return { ok: true, value: record };
	}
}
