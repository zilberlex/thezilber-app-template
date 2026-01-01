import {
	loadLocalStorage,
	saveLocalStorage
} from '$lib/engine/storage/local/local-storage-repository';
import { saveCommandDb, updateCommandDb } from './command-builder-db';

type CommandBuilderLoadRequest = { kind: 'permanent'; commandName: string } | { kind: 'draft' };

const CommandBuilderDraftStateStorageKey = 'DynamicForm';

type CommandBuilderSaveRequest =
	| { kind: 'permanent'; data: CommandBuilderData }
	| { kind: 'draft'; data: CommandBuilderData };

export function saveCbState(saveRequest: CommandBuilderSaveRequest) {
	if (saveRequest.kind === 'permanent') {
		saveCommandDb(saveRequest.data);
	} else {
		saveLocalStorage(CommandBuilderDraftStateStorageKey, saveRequest.data);
	}
}

export function updateCbState(saveRequest: CommandBuilderSaveRequest) {
	if (saveRequest.kind === 'permanent') {
		updateCommandDb(saveRequest.data);
	} else {
		saveLocalStorage(CommandBuilderDraftStateStorageKey, saveRequest.data);
	}
}

export async function loadCbState(loadRequest: CommandBuilderLoadRequest) {
	if (loadRequest.kind === 'permanent') {
		return loadLocalStorage(CommandBuilderDraftStateStorageKey) as CommandBuilderData;
	} else {
		return loadLocalStorage(CommandBuilderDraftStateStorageKey) as CommandBuilderData;
	}
}
