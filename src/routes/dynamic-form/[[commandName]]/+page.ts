// export const ssr = false;
//
// import { redirect } from '@sveltejs/kit';
// import type { PageLoad } from './$types';
//
// import { createSyncableData } from '$lib/engine/storage/data/data';
// import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
// import { loadCbState } from './command-builder-state-store';
// import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte';
//
// const DEFAULT_COMMAND_NAME = 'New Command';
//
// type PageMode = 'draft' | 'permanent';
//
// function getExampleCommand(): CommandBuilderState {
// 	const commandStr = 'cp -r {src} {dest}';
// 	const formData = {
// 		src: { value: './origin/', schema: { type: 'string' } },
// 		dest: { value: './bkp/origin/', schema: { type: 'string' } }
// 	};
//
// 	return { commandStr, formData };
// }
//
// function getBasePath(pathname: string, hasParam: boolean): string {
// 	if (!hasParam) return pathname;
// 	return pathname.replace(/\/[^/]+\/?$/, '');
// }
//
// export const load: PageLoad = async ({ params, url }) => {
// 	const paramsCommandName = params.commandName;
// 	const isPermanent = Boolean(paramsCommandName);
//
// 	const pageMode: PageMode = isPermanent ? 'permanent' : 'draft';
// 	const routeKey = paramsCommandName ?? '__draft__';
//
// 	let loadedState: CommandBuilderRecord | undefined;
//
// 	if (isPermanent) {
// 		const commandName = paramsCommandName!;
// 		loadedState = await loadCbState({ kind: 'permanent', commandName });
//
// 		console.log('Loading Permanent Command', commandName);
// 		if (!loadedState) {
// 			const basePath = getBasePath(url.pathname, true);
// 			const redirectMessage = `CommandName [${paramsCommandName}] not found. Returning to "${basePath}"...`;
// 			console.warn(redirectMessage);
// 			temporaryMessageState.setMessageWithTimout(redirectMessage, 10000);
// 			throw redirect(302, basePath);
// 		}
// 	} else {
// 		loadedState = await loadCbState({ kind: 'draft' });
//
// 		if (!loadedState?.data?.commandStr) {
// 			const exampleForm = getExampleCommand() as PermanentCommandBuilderState;
// 			loadedState = createSyncableData(getDeviceId(), exampleForm);
// 		}
//
// 		loadedState.data.commandName = DEFAULT_COMMAND_NAME;
// 	}
//
// 	if (!loadedState) {
// 		throw new Error('Failed to initialize Command Builder state');
// 	}
//
// 	return {
// 		pageMode,
// 		routeKey,
// 		commandName: paramsCommandName ?? null,
// 		cbData: loadedState
// 	};
// };
