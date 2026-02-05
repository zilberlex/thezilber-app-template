import {
	loadLocalStorage,
	removeLocalStorage,
	saveLocalStorage
} from '$lib/engine/storage/local/local-storage-repository';
import {
	deleteCommandById,
	loadCommandByName,
	saveCommandDb,
	updateCommandDb
} from './command-builder-db-repo';
import {
	commandBuilderRecordAdapter,
	type DbCbRecord,
	type CbRecord,
	type CbState
} from './command-builder-types';

const CommandBuilderDraftStateStorageKey = 'DynamicForm';

async function sleep(msec: number) {
	return new Promise((resolve) => setTimeout(resolve, msec));
}

export class CommandBuilderRepo implements CommandBuilderRepo {
	async update(context: CollectionAppContext, record: CbRecord) {
		const storageType = context.editMode;
		console.log(
			`Saving data to repo [${storageType === 'permanent' ? 'IndexDb' : 'Local Storage'}`
		);

		if (storageType === 'permanent') {
			await updateCommandDb(record);
		} else {
			saveLocalStorage(CommandBuilderDraftStateStorageKey, record);
		}
	}

	async create(context: CollectionAppContext, data: CbState): Promise<DbCbRecord> {
		const { itemKey } = context;

		data.commandName = itemKey;

		const newDbRecord = commandBuilderRecordAdapter.constructDbRecord(data);
		console.log('newDbRecord', newDbRecord);
		const initializedRecord = await saveCommandDb(newDbRecord);

		return initializedRecord;
	}

	async load(context: CollectionAppContext): Promise<DbCbRecord | undefined> {
		const { itemKey } = context;

		// TODO AZ Remove
		await sleep(3000);

		let ret;
		if (context.editMode === 'permanent') {
			ret = await loadCommandByName(itemKey);
		} else {
			ret = await Promise.resolve(
				loadLocalStorage(CommandBuilderDraftStateStorageKey) as DbCbRecord
			);
		}
		console.log('Loading Command', itemKey, 'editMode', context.editMode, 'Command:', ret);

		return ret;
	}

	async delete(context: CollectionAppContext, record: DbCbRecord) {
		if (context.editMode === 'permanent') {
			await deleteCommandById(record.recordId);
			console.log('Deleted Record', record.recordId);
		} else {
			removeLocalStorage(CommandBuilderDraftStateStorageKey);
		}
	}
}
