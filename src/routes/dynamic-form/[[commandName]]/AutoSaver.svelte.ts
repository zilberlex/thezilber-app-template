import { createSmartHandler } from '$lib/engine/events/event-handling';
import { stampSyncableData } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { untrack } from 'svelte';

type AutoSaverOptions = {
	initialDelayMs: number;
	debounceMs: number;
	maxWaitMs: number;
};

const defaultOptions: AutoSaverOptions = {
	initialDelayMs: 2000,
	debounceMs: 2000,
	maxWaitMs: 10000
};

export class AutoSaver<T extends AppRecord<any>> {
	#autoSaveHandler: (e: Event) => Promise<any>;
	#options: AutoSaverOptions;

	#autoSaveArmed: boolean = false;
	#effectDestroy: () => void;

	constructor(
		dataState: T,
		autoSaveHandler: (data: T) => Promise<any>,
		options?: AutoSaverOptions
	) {
		this.#options = {
			...defaultOptions,
			...options
		};

		setTimeout(() => (this.#autoSaveArmed = true), this.#options.initialDelayMs);

		this.#autoSaveHandler = createSmartHandler(
			async () => {
				//todo az move this to Data module
				stampSyncableData(getDeviceId(), dataState);
				await autoSaveHandler(dataState);
			},
			{ debounceDelay: this.#options.debounceMs }
		);

		this.#effectDestroy = $effect.root(() => {
			$effect(() => {
				track(dataState.data);

				untrack(async () => {
					if (!this.#autoSaveArmed) {
						return;
					}

					await this.#autoSaveHandler(null);
				});
			});
		});
	}

	async saveData() {
		await this.#autoSaveHandler(null);
	}

	destroy() {
		this.#effectDestroy();
	}
}
