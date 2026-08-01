import type { Dispatcher } from '$lib/engine/patterns/observer';
import { SvelteMap } from 'svelte/reactivity';
import type { CollectionAppDataState, CollectionAppContextManager, WithOpId } from './types';

export class DataStateManager {
	#dataStates = new SvelteMap<string, CollectionAppDataState>();
	#dataStateOpIdTracking = new Map<string, number>();
	#currentDataState;
	#projectedDataState;
	get dataStates() {
		return this.#dataStates;
	}

	get currentDataState() {
		return this.#currentDataState;
	}

	get projectedDataState() {
		return this.#projectedDataState;
	}

	constructor(
		dataStateDispatcher: Dispatcher<WithOpId<CollectionAppDataState>>,
		contextManager: CollectionAppContextManager<any>
	) {
		this.#currentDataState = $derived.by(() => {
			let dataState = this.#dataStates.get(contextManager.appContext.slug);
			console.log(
				'Changing currentDataState - contextManager.appContext.slug - [',
				contextManager.appContext.slug,
				']',
				'state:',
				dataState
			);

			return dataState;
		});

		this.#projectedDataState = $derived.by(() => {
			let slug = contextManager.projectedContext?.slug;
			return slug ? this.#dataStates.get(slug) : undefined;
		});

		dataStateDispatcher.register((ds) => {
			let slug = ds.slug;
			let currentDataStateEntry = this.#dataStates.get(slug);
			let currentDataStateOpId = this.#dataStateOpIdTracking.get(slug);

			if (!currentDataStateEntry) {
				currentDataStateEntry = {
					kind: 'ready',
					slug: slug,
					displayName: ds.slug,
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
	#updateDataState(ds: WithOpId<CollectionAppDataState>) {
		this.#dataStates.set(ds.slug, ds);
		this.#dataStateOpIdTracking.set(ds.slug, ds.opId);
	}
}
