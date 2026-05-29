import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import {
	loadLocalStorage,
	removeLocalStorage,
	saveLocalStorage
} from '$lib/engine/storage/local/local-storage-repository';
import { stampAppRecord } from '../data';
import type {
	ActionResult,
	CollectionAppBlankResult,
	CollectionAppContext,
	CollectionAppError
} from '../types';
import type {
	AllRecordsProjections,
	AppRecord,
	AppRecordRepo,
	CollectionAppRecord,
	DataProjection,
	DbAdapter,
	SyncableAppRecordMetadata
} from './types';

export class CollectionAppContextualRepo<
	TData extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
> implements AppRecordRepo<TData, TProjection, SyncableAppRecordMetadata, CollectionAppError> {
	#permanentRepo: AppRecordRepo<TData, TProjection, SyncableAppRecordMetadata, CollectionAppError>;
	#dbAdapter: DbAdapter<TData, TProjection, SyncableAppRecordMetadata>;

	#localStorageKey: string;

	constructor(
		permanentRepo: AppRecordRepo<TData, TProjection, SyncableAppRecordMetadata, CollectionAppError>,
		dbName: string,
		dbAdapter: DbAdapter<TData, TProjection, SyncableAppRecordMetadata>
	) {
		this.#permanentRepo = permanentRepo;
		this.#localStorageKey = dbName + '_Draft';
		this.#dbAdapter = dbAdapter;
	}

	async rename(
		context: CollectionAppContext,
		displayName: string
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		if (context.editMode === 'permanent') {
			return await this.#permanentRepo.rename(context, displayName);
		} else {
			throw new Error('Does not Expect to update item names from local repo');
		}
	}

	async create(
		context: CollectionAppContext,
		data: TData,
		newItemKey: string
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		return await this.#permanentRepo.create(context, data, newItemKey);
	}

	async update(
		context: CollectionAppContext,
		record: CollectionAppRecord<TData, TProjection>
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const storageType = context.editMode;
		console.log(
			`Saving data to repo [${storageType === 'permanent' ? 'IndexDb' : 'Local Storage'}]. slug: [${context.slug}]`
		);

		stampAppRecord(getDeviceId(), record.meta);
		this.#dbAdapter.refreshProjection(record);

		if (storageType === 'permanent') {
			return await this.#permanentRepo.update(context, record);
		} else {
			try {
				saveLocalStorage(this.#localStorageKey, record);

				return {
					ok: true,
					value: record
				};
			} catch (e) {
				return {
					ok: false,
					error: { kind: 'General Error', message: getErrorMessage(e), context }
				};
			}
		}
	}

	async load(
		context: CollectionAppContext
	): Promise<
		ActionResult<CollectionAppRecord<TData, TProjection> | undefined, CollectionAppError>
	> {
		if (context.editMode === 'permanent') {
			return await this.#permanentRepo.load(context);
		} else {
			try {
				let record = loadLocalStorage(this.#localStorageKey);

				return {
					ok: true,
					value: record
				};
			} catch (e) {
				return {
					ok: false,
					error: { kind: 'General Error', message: getErrorMessage(e), context }
				};
			}
		}
	}

	async delete(context: CollectionAppContext): Promise<ActionResult<void, CollectionAppError>> {
		if (context.editMode === 'permanent') {
			return await this.#permanentRepo.delete(context);
		} else {
			try {
				removeLocalStorage(this.#localStorageKey);

				return {
					ok: true,
					value: undefined
				};
			} catch (e) {
				return {
					ok: false,
					error: { kind: 'General Error', message: getErrorMessage(e), context }
				};
			}
		}
	}

	async getAllRecordProjections(): Promise<
		ActionResult<
			AllRecordsProjections<TData, TProjection, SyncableAppRecordMetadata>,
			CollectionAppError
		>
	> {
		return await this.#permanentRepo.getAllRecordProjections();
	}

	async getSlug(displayName: string, prevSlug?: string): Promise<string> {
		return await this.#permanentRepo.getSlug(displayName, prevSlug);
	}
}
