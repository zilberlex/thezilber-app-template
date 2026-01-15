export const ssr = false;
import type { PageLoad } from './$types';
import type { AppModel, LoadResult } from './types';

function createInitialModel(): AppModel {
	return {
		title: 'Loading…',
		command: '…'
	};
}

async function loadModel(): Promise<AppModel> {
	// simulate local async (dexie/idb/etc.)
	await new Promise((r) => setTimeout(r, 3000));

	return {
		title: 'Draft Command',
		command: 'cp -r {src} {dest}'
	};
}

export const load: PageLoad = (): LoadResult => {
	return {
		initialModel: createInitialModel(),
		modelPromise: loadModel()
	};
};
