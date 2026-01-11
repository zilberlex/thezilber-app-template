import { createAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import {
	loadLocalStorage,
	saveLocalStorage
} from '$lib/engine/storage/local/local-storage-repository';
import { loadCommandByName, saveCommandDb, updateCommandDb } from './command-builder-db-repo';

const CommandBuilderDraftStateStorageKey = 'DynamicForm';

export class CommandBuilderStore implements RecordStore<PermanentCommandBuilderState> {
	#isPermanent: boolean;
	constructor(editMode: EditMode) {
		this.#isPermanent = editMode === 'permanent';
	}

	async update(record: AppRecord<PermanentCommandBuilderState>) {
		if (this.#isPermanent) {
			await updateCommandDb(record);
		} else {
			saveLocalStorage(CommandBuilderDraftStateStorageKey, record);
		}
	}

	async create(
		recordKey: string,
		data: PermanentCommandBuilderState
	): Promise<AppRecord<PermanentCommandBuilderState>> {
		data.commandName = recordKey;

		const newRecord = createAppRecord(getDeviceId(), data);
		const initializedRecord = await saveCommandDb(newRecord);

		return initializedRecord;
	}

	async load(recordKey: string): Promise<AppRecord<PermanentCommandBuilderState> | undefined> {
		let ret;
		if (this.#isPermanent) {
			ret = await loadCommandByName(recordKey);
		} else {
			ret = await Promise.resolve(
				loadLocalStorage(CommandBuilderDraftStateStorageKey) as CommandBuilderRecord
			);
		}
		console.log('Loading Command', recordKey, 'isPermanent: ', this.#isPermanent, 'Command:', ret);

		return ret;
	}
}
