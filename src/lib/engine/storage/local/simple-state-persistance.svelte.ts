// simple-state-persistance.svelte.ts
import * as devalue from 'devalue';
import { loadLocalStorage, saveLocalStorage } from './local-storage-repository';

export function saveLocalState<T extends object>(key: string, state: T) {
	saveLocalStorage(key, devalue.stringify(state));
}

export function loadLocalState<T extends object>(key: string): T | undefined {
	const serialized = loadLocalStorage(key);

	if (!serialized) {
		return undefined;
	}

	return devalue.parse(serialized) as T;
}
