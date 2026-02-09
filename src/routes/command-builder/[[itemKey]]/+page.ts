// export const ssr = false;
//
// import { CommandBuilderRepo } from './command-builder-state-store';
// import type { PageLoad, PageLoadEvent } from './$types';
// import { createDbAppRecord } from '$lib/engine/storage/data/data';
// import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
// import type { CbState } from './command-builder-types';
//
// type AppData = CbState;
//
// function getCollectionAppContext(loadEvent: PageLoadEvent): CollectionAppContext {
// 	const { params } = loadEvent;
// 	const itemKey = params.itemKey;
// 	const isPermanent = Boolean(itemKey);
//
// 	return {
// 		itemKey,
// 		editMode: isPermanent ? 'permanent' : 'draft'
// 	};
// }
//
// function getExampleCommand(): CbState {
// 	const commandName = 'Draft Command';
// 	const commandStr = 'cp -r {src} {dest}';
// 	const formData = {
// 		src: { value: './origin/', schema: { type: 'string' } },
// 		dest: { value: './bkp/origin/', schema: { type: 'string' } }
// 	};
//
// 	return { commandName, commandStr, formData };
// }
//
// function createPlaceholderCommand(): AppData {
// 	return {
// 		commandName: 'Lol',
// 		commandStr: 'MegaLol',
// 		formData: {}
// 	};
// }
//
// function createPlaceholderRecord(): AppRecord<AppData> {
// 	return createDbAppRecord(getDeviceId(), createPlaceholderCommand());
// }
//
// function createExampleRecord(): AppRecord<AppData> {
// 	return createDbAppRecord(getDeviceId(), getExampleCommand());
// }
//
// function loadAppRuntime(appContext: CollectionAppContext): CollectionAppRuntime<AppData> {
// 	let store: RecordStore<AppData> = new CommandBuilderRepo(appContext.editMode);
//
// 	const recordManager = RecordManager.create(store, createPlaceholderRecord());
// 	if (appContext.editMode === 'draft') {
// 		if (appContext.editMode === 'draft') {
// 			recordManager.loadOrDefault(appContext.itemKey, createExampleRecord());
// 		} else {
// 			recordManager.load(appContext.itemKey);
// 		}
// 	}
//
// 	return { recordManager };
// }
//
// const loadCollectionAppInfra: PageLoad = async function (
// 	loadEvent
// ): Promise<CollectionAppEnvironment<AppData>> {
// 	console.log('navigated page load');
//
// 	let collectionAppContext = getCollectionAppContext(loadEvent);
//
// 	console.log('Loading App Context', collectionAppContext);
//
// 	let runtime = loadAppRuntime(collectionAppContext);
//
// 	return {
// 		...collectionAppContext,
// 		runtime: runtime
// 	};
// };
//
// export const load: PageLoad = async (loadEvent) => {
// 	return await loadCollectionAppInfra(loadEvent);
// };
