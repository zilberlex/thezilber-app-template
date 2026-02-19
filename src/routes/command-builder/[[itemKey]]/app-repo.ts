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
import { error } from '@sveltejs/kit';

const CommandBuilderDraftStateStorageKey = 'DynamicForm';

async function sleep(msec: number) {
	return new Promise((resolve) => setTimeout(resolve, msec));
}

class CommandBuilderRepo implements CbRepo {
	async update(
		context: CollectionAppContext,
		record: CbRecord
	): Promise<ActionResult<void, CollectionAppError>> {
		const storageType = context.editMode;
		console.log(
			`Saving data to repo [${storageType === 'permanent' ? 'IndexDb' : 'Local Storage'}`
		);

		let promise: Promise<void>;
		if (storageType === 'permanent') {
			promise = updateCommandDb(record);
		} else {
			promise = Promise.resolve(saveLocalStorage(CommandBuilderDraftStateStorageKey, record));
		}

		try {
			await promise;
			return { ok: true, value: undefined };
		} catch (e) {
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
		}
	}

	async create(
		context: CollectionAppContext,
		data: CbState
	): Promise<ActionResult<DbCbRecord, CollectionAppError>> {
		let itemKey = data.commandName;
		const newDbRecord = cbRecordAdaper.constructDbRecord(data);
		console.log('creating new record. itemKey', itemKey, 'DbRecord', newDbRecord);
		try {
			const initializedRecord = await saveCommandDb(newDbRecord);
			return { ok: true, value: initializedRecord };
		} catch (e) {
			if (e instanceof Dexie.ConstraintError) {
				console.warn('Create, got ConstraintError', e);
				return {
					ok: false,
					error: { kind: 'Key Already Exists', message: `Item Key: [${itemKey}] already exists` }
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
			console.log('Loading Command', itemKey, 'editMode', context.editMode, 'Command:', retPromise);
			return { ok: true, value: result };
		} catch (e) {
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
		}
	}

	async delete(
		context: CollectionAppContext,
		record: DbCbRecord
	): Promise<ActionResult<void, CollectionAppError>> {
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
			return { ok: false, error: { kind: 'General Error', message: getErrorMessage(e) } };
		}
	}
}

export const cbRepo = new CommandBuilderRepo();
