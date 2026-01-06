import {
	loadLocalStorage,
	saveLocalStorage
} from '$lib/engine/storage/local/local-storage-repository';
import { loadCommandByName, saveCommandDb, updateCommandDb } from './command-builder-db';

type CommandBuilderLoadRequest = { kind: 'permanent'; commandName: string } | { kind: 'draft' };

const CommandBuilderDraftStateStorageKey = 'DynamicForm';

type CommandBuilderSaveRequest =
	| { kind: 'permanent'; saveData: CommandBuilderData }
	| { kind: 'draft'; saveData: CommandBuilderData };

export async function saveCbState(saveRequest: CommandBuilderSaveRequest) {
	if (saveRequest.kind === 'permanent') {
		await saveCommandDb(saveRequest.saveData);
	} else {
		saveLocalStorage(CommandBuilderDraftStateStorageKey, saveRequest.saveData);
	}
}

export async function updateCbState(saveRequest: CommandBuilderSaveRequest) {
	if (saveRequest.kind === 'permanent') {
		await updateCommandDb(saveRequest.saveData);
	} else {
		saveLocalStorage(CommandBuilderDraftStateStorageKey, saveRequest.saveData);
	}
}

export async function loadCbState(loadRequest: CommandBuilderLoadRequest) {
	if (loadRequest.kind === 'permanent') {
		return await loadCommandByName(loadRequest.commandName);
	} else {
		return loadLocalStorage(CommandBuilderDraftStateStorageKey) as CommandBuilderData;
	}
}
