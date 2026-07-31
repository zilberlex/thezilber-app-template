import type { PersistedCommandStack } from '../patterns/command/command-stack/command-stack';
import { loadLocalState, saveLocalState } from '../storage/local/simple-state-persistance.svelte';
import type { AppState } from './application-state.svelte';

export function saveCommandStack(appState: AppState) {
	if (!appState.appContext) {
		const messsage = `AppState appContext not set`;
		appState.logger.warn(messsage, {
			scope: 'CommandStack',
			operation: 'Save'
		});
		console.warn(messsage);

		return;
	}

	let persistentStack = appState.commandStack.persistStack();
	if (persistentStack) {
		saveLocalState(constructCommandStackContext(appState), persistentStack);
	} else {
		console.warn('SAVE No Command Stack Present');
	}
}

export function loadCommandStack(appState: AppState) {
	if (!appState.appContext) {
		const messsage = `AppState appContext not set`;
		appState.logger.warn(messsage, {
			scope: 'CommandStack',
			operation: 'Load'
		});
		console.warn(messsage);

		return;
	}

	const commandStackContext = constructCommandStackContext(appState);
	let persistentStack = loadLocalState<PersistedCommandStack>(commandStackContext);

	if (!persistentStack) {
		console.warn('LOAD no Command Stack Present', {
			commandStackContext
		});
		return;
	}

	appState.commandStack.hydrate(persistentStack, appState.commandRegistry);
}

function constructCommandStackContext(appState: AppState) {
	return `${appState.appContext}-COMMANDS`;
}
