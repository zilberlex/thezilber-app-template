import type { PersistableCommand, PersistedCommand } from '$lib/engine/patterns/command/persistent-command';
import { Registry } from './registry';

export type CommandRegistry = Registry<PersistedCommand<any>, PersistableCommand<any>>;

export function createCommandRegistry() {
	return new Registry<PersistedCommand<string>, PersistableCommand<any>>(
		(persistentCommand) => persistentCommand.itemType
	);
}
