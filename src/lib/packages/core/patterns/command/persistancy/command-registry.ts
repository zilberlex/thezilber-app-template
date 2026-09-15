import type { PersistableCommand, PersistedCommand } from '$lib/packages/core';
import { Registry } from '../../registry';

export type CommandRegistry = Registry<PersistedCommand<any>, PersistableCommand<any>>;

export function createCommandRegistry() {
	return new Registry<PersistedCommand<string>, PersistableCommand<any>>(
		(persistentCommand) => persistentCommand.itemType
	);
}
