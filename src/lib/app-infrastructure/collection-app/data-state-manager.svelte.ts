import type { Dispatcher } from '$lib/engine/patterns/observer';
import { SvelteMap } from 'svelte/reactivity';

export class DataStateManager {
	#dataStates = new SvelteMap<string, AppDataState>();
	#dataStateOpIdTracking = new Map<string, number>();

	get dataStates() {
		return this.#dataStates;
	}

	constructor(dataStateDispatcher: Dispatcher<WithOpId<AppDataState>>) {
		dataStateDispatcher.register((ds) => {
			let key = ds.key;
			let currentDataStateEntry = this.#dataStates.get(key);
			let currentDataStateOpId = this.#dataStateOpIdTracking.get(key);

			if (!currentDataStateEntry) {
				currentDataStateEntry = {
					kind: 'ready',
					key,
					context: ds.context
				};
			}

			if (currentDataStateOpId === ds.opId) {
				this.#updateDataState(ds);
			} else {
				if (currentDataStateEntry.kind === 'loading' && ds.kind !== 'loading') {
					console.warn(
						'DS Event for none loading operation received during loading of the entry, Ignoring dataStateEvent... current dataState entry:',
						currentDataStateEntry,
						'new dataState Event',
						ds
					);
				} else if (currentDataStateOpId === undefined || currentDataStateOpId <= ds.opId) {
					this.#updateDataState(ds);
				} else {
					// TODO AZ dont emit warnings on consecutive saves
					console.warn(
						'DS Event of older operation received, probably a race condition that should be ignored. currentDataState',
						currentDataStateEntry,
						'dataStateEvent',
						ds
					);
				}
			}
		});
	}
	#updateDataState(ds: WithOpId<AppDataState>) {
		this.#dataStates.set(ds.key, ds);
		this.#dataStateOpIdTracking.set(ds.key, ds.opId);
	}
}
