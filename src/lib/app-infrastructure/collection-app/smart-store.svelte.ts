import { browser } from '$app/environment';
import { DispatcherImpl, type Dispatcher, type DispatchHandler } from '$lib/engine/patterns/observer';
import type {
	AppRecordRepo,
	DataProjection,
	DbAdapter,
	SyncableAppRecordMetadata
} from '$lib/app-infrastructure/collection-app/data/types';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { stampAppRecord } from './data';
import type {
	AppDataState,
	CollectionAppContext,
	CollectionAppError,
	CollectionAppRecord,
	StoreDeleteActionResult,
	StoreSaveActionResult,
	WithOpId
} from './types';
import { CollectionAppCache } from './collectionAppCache.svelte';

type SaveOperationsParams<T, TProjection extends DataProjection> =
	| {
			kind: 'update';
			context: CollectionAppContext;
			record: CollectionAppRecord<T, TProjection>;
	  }
	| {
			kind: 'create';
			context: CollectionAppContext;
			newItemDisplayName: string;
			record: CollectionAppRecord<T, TProjection>;
	  }
	| {
			kind: 'rename';
			context: CollectionAppContext;
			newItemDisplayName: string;
	  };

export type SmartStoreOptions<T> = {
	loadNotFoundBehavior: { action: 'error' } | { action: 'create-new'; createObj: () => T };
};

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

export class SmartStore<T, TProjection extends DataProjection> implements Dispatcher<WithOpId<AppDataState>> {
	#context: CollectionAppContext;
	#record: CollectionAppRecord<T, TProjection>;

	#dbAdapter: DbAdapter<T, TProjection, SyncableAppRecordMetadata>;
	#repository: AppRecordRepo<T, TProjection, SyncableAppRecordMetadata, CollectionAppError>;
	#collectionAppCache: CollectionAppCache<T, TProjection>;

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

		this.#dbAdapter = dbAdapter;
		this.#record = $state(this.#dbAdapter.constructRecord(placeHolderValue));
		this.#repository = repository;
		this.#collectionAppCache = new CollectionAppCache((slug) =>
			this.#repository.load({
				slug,
				editMode: 'permanent'
			})
		);

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
				this.#collectionAppCache.updateProjection(p.slug, p);
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
		return this.#collectionAppCache.projections;
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

	async #saveOperations(saveOperationsParams: SaveOperationsParams<T, TProjection>) {
		const { kind: operation, context, record } = saveOperationsParams;
		let opId = this.#nextOpId();

		let contextSnapshot = context;

		console.log('saveOperations - operation', operation, 'record:', $state.snapshot(this.#record));

		stampAppRecord(getDeviceId(), this.#record.meta);
		this.#dbAdapter.refreshProjection(record);

		let saveRecord = $state.snapshot(record) as RecordI<T, TProjection>;

		let prevItemSlug = contextSnapshot.slug;
		let prevItemDisplayName = contextSnapshot.displayName;

		let newItemDisplayName =
			operation === 'update' ? saveRecord.projection.displayName : saveOperationsParams.newItemDisplayName;

		let slug = saveRecord.slug;
		if (newItemDisplayName !== prevItemDisplayName) {
			console.log('Requesting new slug for displayName', newItemDisplayName);
			slug = await this.#repository.getSlug(newItemDisplayName, saveRecord.slug);
			console.log('Generated Slug for displayName', newItemDisplayName, 'slug:', slug);
		}

		let signalKind: 'saving' | 'creating' | 'renaming';
		switch (operation) {
			case 'update':
				signalKind = 'saving';
				console.log(`Saving Data...`, saveRecord.data);

				break;
			case 'create':
				signalKind = 'creating';
				console.log(`Creating Data...`, saveRecord.data);

				break;
			case 'rename':
				signalKind = 'renaming';
				console.log(`Renaming Data...`, saveRecord.data);

				break;
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
		} else if (operation === 'create') {
			let saveData = saveRecord.data;
			console.log('create record. slug:', slug, 'displayName:', newItemDisplayName, 'context:', contextSnapshot);

			res = await this.#repository.create(contextSnapshot, saveData, newItemDisplayName, slug);
		} else {
			console.log('create record. slug:', slug, 'displayName:', newItemDisplayName, 'context:', contextSnapshot);
			res = await this.#repository.rename(contextSnapshot, newItemDisplayName);
		}

		// request success operations
		if (res.ok) {
			let record = res.value;
			this.#collectionAppCache.updateRecordCache(record);

			this.#signalStateChange(
				{
					kind: 'ready',
					context: contextSnapshot,
					slug,
					prevSlug: prevItemSlug,
					displayName: newItemDisplayName,
					prevDisplayName: prevItemDisplayName
				},
				opId
			);

			if (contextSnapshot.slug === this.#context.slug) {
				// this check is to prevent changing of working record during context changes
				this.#record = record;
			}
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
		} = await this.#saveOperations({
			context: this.#context,
			kind: 'update',
			record: this.#record
		});

		if (res.ok) {
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
			this.#signalStateChange({ kind: 'error', slug, context: contextSnapshot, errorData: res.error }, opId);
			return { ok: false, error: res.error };
		}
	}

	async saveAs(context: CollectionAppContext, newItemDisplayName: string): Promise<StoreSaveActionResult> {
		let {
			repoOpResult: res,
			opId,
			slug,
			displayName,
			contextSnapshot
		} = await this.#saveOperations({
			context,
			kind: 'create',
			record: this.#record,
			newItemDisplayName: newItemDisplayName
		});

		if (res.ok) {
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
		let { displayName, slug } = context;
		this.#signalStateChange(
			{
				kind: 'deleting',
				slug: ctxSnapshot.slug,
				displayName: displayName ?? '_draft_',
				context: ctxSnapshot
			},
			opId
		);
		console.log('deleting item', ctxSnapshot);

		let undoCacheDelte = this.#collectionAppCache.deleteRecord(slug);
		let res = await this.#repository.delete(ctxSnapshot);

		if (res.ok) {
			this.#signalStateChange(
				{
					kind: 'deleted',
					slug,
					displayName: displayName ?? '_draft_',
					context: ctxSnapshot
				},
				opId
			);
			return {
				ok: true,
				value: { kind: 'deleted', key: ctxSnapshot.slug, context: ctxSnapshot }
			};
		} else {
			undoCacheDelte();
			console.warn('Store - Delete Failed for', context);
			return res;
		}
	}

	async rename(context: CollectionAppContext, newName: string) {
		let opId = this.#nextOpId();
		let ctxSnapshot = $state.snapshot(context);

		// This display name may be wrong udner some conditions, but in general it is good enough
		let { displayName: prevDisplayName, slug: prevSlug } = context;
		this.#signalStateChange(
			{
				kind: 'renaming',
				slug: 'TBD',
				prevSlug,
				displayName: newName,
				prevDisplayName: prevDisplayName ?? '_draft_',
				context: ctxSnapshot
			},
			opId
		);
		console.log('Renaming item', ctxSnapshot, 'new name:', newName);

		// TODO AZ probably need to undo this delete on non success
		let res = await this.#repository.rename(ctxSnapshot, newName);

		if (res.ok) {
			let updatedRecord = res.value;
			this.#collectionAppCache.updateRecordCache(updatedRecord, prevSlug);
			this.#signalStateChange(
				{
					kind: 'renamed',
					slug: updatedRecord.slug,
					prevSlug,
					displayName: updatedRecord.projection.displayName,
					prevDisplayName: prevDisplayName ?? '_draft_',
					context: ctxSnapshot
				},
				opId
			);
			return {
				ok: true,
				value: { kind: 'deleted', key: ctxSnapshot.slug, context: ctxSnapshot }
			};
		} else {
			console.warn('Store - Delete Failed for', context);
			return res;
		}
	}

	// TODO AZ Return ReloadResult
	async reload(newContext: CollectionAppContext, placeHolderValue?: T, options?: SmartStoreOptions<T>) {
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

		let { abort, abortablePromise } = abortable(this.#collectionAppCache.getRecord(newSlug));
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
}
