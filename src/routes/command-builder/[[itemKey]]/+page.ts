export const ssr = false;

import { CommandBuilderStore } from './command-builder-state-store';
import { RecordManager } from '$lib/app-infrastructure/record-manager.svelte';
import type { PageLoad, PageLoadEvent } from './$types';
import { createAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import type {
	CollectionAppContext,
	CollectionAppEnvironment,
	CollectionAppRuntime,
	RecordStore
} from '$lib/app-infrastructure/types';
import { AsyncState } from '$lib/app-infrastructure/async-state.svelte';

type AppData = PermanentCommandBuilderState;

function getCollectionAppContext(loadEvent: PageLoadEvent): CollectionAppContext {
	const { params } = loadEvent;
	const itemKey = params.itemKey;
	const isPermanent = Boolean(itemKey);

	return {
		itemKey,
		editMode: isPermanent ? 'permanent' : 'draft'
	};
}

function getExampleCommand(): PermanentCommandBuilderState {
	const commandName = 'Draft Command';
	const commandStr = 'cp -r {src} {dest}';
	const formData = {
		src: { value: './origin/', schema: { type: 'string' } },
		dest: { value: './bkp/origin/', schema: { type: 'string' } }
	};

	return { commandName, commandStr, formData };
}

function createPlaceholderCommand(): AppData {
	return {
		commandName: 'Lol',
		commandStr: 'MegaLol',
		formData: {}
	};
}

function createPlaceholderRecord(): AppRecord<AppData> {
	return createAppRecord(getDeviceId(), createPlaceholderCommand());
}

function loadAppRuntime(appContext: CollectionAppContext): CollectionAppRuntime<AppData> {
	let store: RecordStore<AppData> = new CommandBuilderStore(appContext.editMode);

	let routeRecordPromise = store.load(appContext.itemKey).then((record) => {
		let ret: AppRecord<AppData>;
		if (!record) {
			if (appContext.editMode === 'permanent') {
				throw Error('implement reroute');
			} else {
				ret = createAppRecord(getDeviceId(), getExampleCommand());
			}
		} else {
			ret = record;
		}

		return ret;
	});

	let recordManager = RecordManager.create(
		new AsyncState(routeRecordPromise, createPlaceholderRecord()),
		store
	);

	return { recordManager };
}

const loadCollectionAppInfra: PageLoad = async function (
	loadEvent
): Promise<CollectionAppEnvironment<AppData>> {
	console.log('navigated page load');

	let collectionAppContext = getCollectionAppContext(loadEvent);

	console.log('Loading App Context', collectionAppContext);

	let runtime = loadAppRuntime(collectionAppContext);

	return {
		...collectionAppContext,
		runtime: runtime
	};
};

export const load: PageLoad = async (loadEvent) => {
	return await loadCollectionAppInfra(loadEvent);
};
