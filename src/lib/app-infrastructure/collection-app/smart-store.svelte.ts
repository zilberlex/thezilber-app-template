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
	CollectionAppDataState as CollectionAppDataState,
	CollectionAppContext,
	CollectionAppError,
	CollectionAppRecord,
	CollectionAppRepo,
	StoreDeleteActionResult,
	StoreSaveActionResult,
	WithOpId
} from './types';
import { CollectionAppCache } from './collectionAppCache.svelte';
import { slugify } from './data/slugify';

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

type PreparedSaveOperation<T, TProjection extends DataProjection> = {
	operation: 'update' | 'create' | 'rename';
	signalKind: 'saving' | 'creating' | 'renaming';
	contextSnapshot: CollectionAppContext;
	prevSlug: string;
	prevDisplayName: string;
	newItemDisplayName: string;
	saveRecordSnapshot?: CollectionAppRecord<T, TProjection>;
	optimisticSlug: string;
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

export class SmartStore<T, TProjection extends DataProjection> implements Dispatcher<WithOpId<CollectionAppDataState>> {
	#context: CollectionAppContext;
	#record: CollectionAppRecord<T, TProjection>;

	#dbAdapter: DbAdapter<T, TProjection, SyncableAppRecordMetadata>;
	#repository: CollectionAppRepo<T, TProjection>;
	#collectionAppCache: CollectionAppCache<T, TProjection>;

	#reloadAbort: (() => void) | undefined;

	#dataStateDispatacher = new DispatcherImpl<WithOpId<CollectionAppDataState>>();
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

	register(handler: DispatchHandler<WithOpId<CollectionAppDataState>>): void {
		this.#dataStateDispatacher.register(handler);
	}

	unregister(handler: DispatchHandler<WithOpId<CollectionAppDataState>>): boolean {
		return this.#dataStateDispatacher.unregister(handler);
	}

	#nextOpId(): number {
		return ++this.#runningOpId;
	}

	#signalStateChange(dataState: CollectionAppDataState, opId: number) {
		this.#dataStateDispatacher.signal({ ...dataState, opId });
	}

	async #saveOperations(params: SaveOperationsParams<T, TProjection>) {
		const opId = this.#nextOpId();
		const operation = this.#prepareSaveOperation(params);

		const saveOperationResult = (() => {
			switch (operation.operation) {
				case 'update': {
					if (!operation.saveRecordSnapshot) {
						throw new Error('Update operation requires saveRecordSnapshot');
					}

					console.log('Updating record', {
						context: operation.contextSnapshot,
						record: operation.saveRecordSnapshot
					});

					return this.#repository.update(operation.contextSnapshot, operation.saveRecordSnapshot);
				}

				case 'create': {
					if (!operation.saveRecordSnapshot) {
						throw new Error('Create operation requires saveRecordSnapshot');
					}

					console.log('Creating record', {
						prevSlug: operation.prevSlug,
						displayName: operation.newItemDisplayName,
						context: operation.contextSnapshot
					});

					return this.#repository.create(
						operation.contextSnapshot,
						operation.saveRecordSnapshot.data,
						operation.newItemDisplayName
					);
				}

				case 'rename': {
					console.log('Renaming record', {
						prevSlug: operation.prevSlug,
						prevDisplayName: operation.prevDisplayName,
						newDisplayName: operation.newItemDisplayName,
						context: operation.contextSnapshot
					});

					return this.#repository.rename(operation.contextSnapshot, operation.newItemDisplayName);
				}
				default:
					throw new Error(`Operation Not Defined: ${JSON.stringify(operation)}`);
			}
		})();

		this.#signalStateChange(
			{
				kind: operation.signalKind,
				context: operation.contextSnapshot,
				slug: operation.optimisticSlug,
				prevSlug: operation.prevSlug,
				displayName: operation.newItemDisplayName,
				prevDisplayName: operation.prevDisplayName
			},
			opId
		);

		const dbResult = await saveOperationResult.resultPromise;

		let retRecord: CollectionAppRecord<T, TProjection> | undefined;

		if (dbResult.ok) {
			retRecord = dbResult.value;

			if (operation.operation === 'rename' || operation.operation === 'update') {
				this.#collectionAppCache.updateRecordCache(retRecord, operation.prevSlug);
			} else {
				this.#collectionAppCache.updateRecordCache(retRecord);
			}

			this.#signalStateChange(
				{
					kind: 'ready',
					context: operation.contextSnapshot,
					slug: retRecord.slug,
					prevSlug: operation.prevSlug,
					displayName: retRecord.projection.displayName,
					prevDisplayName: operation.prevDisplayName
				},
				opId
			);

			if (operation.contextSnapshot.slug === this.#context.slug) {
				this.#record = retRecord;
			}
		}

		return {
			repoOpResult: dbResult,
			opId,
			slug: retRecord?.slug ?? operation.optimisticSlug,
			displayName: retRecord?.projection.displayName ?? operation.newItemDisplayName,
			prevDisplayName: operation.prevDisplayName,
			prevSlug: operation.prevSlug,
			contextSnapshot: operation.contextSnapshot
		};
	}

	#prepareSaveOperation(params: SaveOperationsParams<T, TProjection>): PreparedSaveOperation<T, TProjection> {
		const contextSnapshot = $state.snapshot(params.context);

		if (params.kind === 'update' || params.kind === 'create') {
			const saveRecordSnapshot = $state.snapshot(params.record) as CollectionAppRecord<T, TProjection>;
			stampAppRecord(getDeviceId(), saveRecordSnapshot.meta);

			const newItemDisplayName =
				params.kind === 'update' ? saveRecordSnapshot.projection.displayName : params.newItemDisplayName;

			const optimisticSlug = slugify(newItemDisplayName);

			return {
				operation: params.kind,
				signalKind: params.kind === 'update' ? 'saving' : 'creating',
				contextSnapshot,
				prevSlug: saveRecordSnapshot.slug,
				prevDisplayName: saveRecordSnapshot.projection.displayName,
				newItemDisplayName,
				saveRecordSnapshot,
				optimisticSlug
			};
		}

		return {
			operation: 'rename',
			signalKind: 'renaming',
			contextSnapshot,
			prevSlug: contextSnapshot.slug,
			prevDisplayName: contextSnapshot.displayName ?? '',
			newItemDisplayName: params.newItemDisplayName,
			optimisticSlug: slugify(params.newItemDisplayName)
		};
	}

	async save(): Promise<StoreSaveActionResult> {
		let {
			repoOpResult: res,
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
			console.log('Saved Record', {
				slug,
				prevSlug,
				contextSnapshot,
				record: res.value
			});

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
			return { ok: false, error: res.error };
		}
	}

	async saveAs(context: CollectionAppContext, newItemDisplayName: string): Promise<StoreSaveActionResult> {
		let {
			repoOpResult: res,
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
			this.#signalStateChange(
				{
					kind: 'error',
					slug,
					context: ctxSnapshot,
					errorData: res.error
				},
				opId
			);

			return res;
		}
	}

	async rename(context: CollectionAppContext, newName: string): Promise<StoreSaveActionResult> {
		let {
			repoOpResult: res,
			slug,
			prevSlug,
			displayName,
			prevDisplayName,
			contextSnapshot
		} = await this.#saveOperations({
			context,
			kind: 'rename',
			newItemDisplayName: newName
		});

		if (res.ok) {
			return {
				ok: true,
				value: {
					kind: 'rename',
					newSlug: slug,
					prevSlug,
					newDisplayName: displayName,
					prevDisplayName: prevDisplayName ?? '',
					context: contextSnapshot
				}
			};
		} else {
			return { ok: false, error: res.error };
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
