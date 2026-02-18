import { createSmartHandler } from '$lib/engine/events/event-handling';
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

export class AutoSaver<T> {
	#autoSaveHandler: () => Promise<any>;
	#options: AutoSaverOptions;

	#autoSaveArmed: boolean = false;
	#effectDestroy: () => void;

	constructor(data: T, autoSaveHandler: (data: T) => Promise<any>, options?: AutoSaverOptions) {
		this.#options = {
			...defaultOptions,
			...options
		};

		setTimeout(() => (this.#autoSaveArmed = true), this.#options.initialDelayMs);

		this.#autoSaveHandler = createSmartHandler(
			async () => {
				//todo az move this to Data module
				await autoSaveHandler(data);
			},
			{ debounceDelay: this.#options.debounceMs }
		);

		this.#effectDestroy = $effect.root(() => {
			$effect(() => {
				track(data);

				untrack(async () => {
					if (!this.#autoSaveArmed) {
						return;
					}

					await this.#autoSaveHandler();
				});
			});
		});
	}

	destroy() {
		this.#effectDestroy();
	}
}
