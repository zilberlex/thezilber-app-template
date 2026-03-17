import {
	loadLocalStorage,
	removeLocalStorage,
	saveLocalStorage
} from '$lib/engine/storage/local/local-storage-repository';
import { deleteCommandById, loadCommandByName, saveCommandDb, updateCommandDb } from './db-repo';
import {
	cbRecordAdaper,
	type DbCbRecord,
	type CbRecord,
	type CbState
} from './command-builder-types';
import type { CbRepo } from './types';
import { Dexie } from 'dexie';
import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';
import type {
	ActionResult,
	AllRecordsInfo,
	CollectionAppContext,
	CollectionAppError
} from '$lib/app-infrastructure/collection-app/types';
import type { SyncableAppRecordMetadata } from '$lib/engine/storage/data/types';
import { error } from '@sveltejs/kit';

const CommandBuilderDraftStateStorageKey = 'DynamicForm';

async function sleep(msec: number) {
	return new Promise((resolve) => setTimeout(resolve, msec));
}

class CommandBuilderRepo implements CbRepo {
	getAllRecords(): Promise<
		ActionResult<AllRecordsInfo<SyncableAppRecordMetadata>, CollectionAppError>
	> {
		throw new Error('Method not implemented.');
	}
	async update(
		context: CollectionAppContext,
		record: DbCbRecord
	): Promise<ActionResult<DbCbRecord, CollectionAppError>> {
		const storageType = context.editMode;
		console.log(
			`Saving data to repo [${storageType === 'permanent' ? 'IndexDb' : 'Local Storage'}]. itemKey: [${context.itemKey}]`
		);
		await sleep(2000);

		let promise: Promise<DbCbRecord>;
		if (storageType === 'permanent') {
			promise = updateCommandDb(record);
		} else {
			saveLocalStorage(CommandBuilderDraftStateStorageKey, record);
			promise = Promise.resolve(record);
		}

		try {
			await promise;
			return { ok: true, value: record };
		} catch (e) {
			console.error('Failed Updated', e);
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e), context } };
		}
	}

	async create(
		context: CollectionAppContext,
		data: CbState,
		newItemKey: string
	): Promise<ActionResult<DbCbRecord, CollectionAppError>> {
		let itemKey = newItemKey;
		data.commandName = newItemKey;
		const newDbRecord = cbRecordAdaper.constructDbRecord(data);
		await sleep(3000);
		console.log('creating new record. itemKey', itemKey, 'DbRecord', newDbRecord);
		try {
			const initializedRecord = await saveCommandDb(newDbRecord);
			return { ok: true, value: initializedRecord };
		} catch (e) {
			if (e instanceof Dexie.ConstraintError) {
				console.warn('Create, got ConstraintError', e);
				return {
					ok: false,
					error: {
						kind: 'Key Already Exists',
						message: `Item Key: [${itemKey}] already exists`,
						context
					}
				};
			} else {
				throw e;
			}
		}
	}

	async load(
		context: CollectionAppContext
	): Promise<ActionResult<DbCbRecord | undefined, CollectionAppError>> {
		const { itemKey } = context;

		// TODO AZ Remove
		await sleep(3000);

		let retPromise;
		if (context.editMode === 'permanent') {
			retPromise = loadCommandByName(itemKey);
		} else {
			retPromise = Promise.resolve(
				loadLocalStorage(CommandBuilderDraftStateStorageKey) as DbCbRecord
			);
		}

		try {
			let result = await retPromise;
			console.log(`Fetched Command ${itemKey}, editMode ${context.editMode}, Command: `, result);
			return { ok: true, value: result };
		} catch (e) {
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e), context } };
		}
	}

	async delete(
		context: CollectionAppContext,
		record: DbCbRecord
	): Promise<ActionResult<void, CollectionAppError>> {
		await sleep(3000);
		let promise: Promise<void>;
		if (context.editMode === 'permanent') {
			promise = deleteCommandById(record.recordId);
		} else {
			promise = Promise.resolve(removeLocalStorage(CommandBuilderDraftStateStorageKey));
		}

		try {
			await promise;
			return { ok: true, value: undefined };
		} catch (e) {
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e), context } };
		}
	}
}

export const cbRepo = new CommandBuilderRepo();
