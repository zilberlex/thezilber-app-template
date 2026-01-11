export const ssr = false;

import { CommandBuilderStore } from './command-builder-state-store';
import { RecordManager } from '$lib/app-infrastructure/abstract-record-manager.svelte';
import type { PageLoad, PageLoadEvent } from './$types';
import { createAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';

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

export const load: PageLoad = async (loadEvent) => {
	console.log('navigated page load');

	let collectionAppContext = getCollectionAppContext(loadEvent);

	let store: RecordStore<PermanentCommandBuilderState> = new CommandBuilderStore(
		collectionAppContext.editMode
	);

	console.log('Loading App Context', collectionAppContext);

	let routeRecord = await store.load(collectionAppContext.itemKey);

	if (!routeRecord) {
		if (collectionAppContext.editMode === 'permanent') {
			throw Error('implement reroute');
		} else {
			routeRecord = createAppRecord(getDeviceId(), getExampleCommand());
		}
	}

	let recordManager = new RecordManager(routeRecord, store);

	return {
		...collectionAppContext,
		recordManager
	};
};
