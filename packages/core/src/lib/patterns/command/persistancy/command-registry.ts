import type { PersistableCommand, PersistedCommand } from 'packages/core/src/lib/index';
import { Registry } from '../../registry';

export type CommandRegistry = Registry<PersistedCommand<any>, PersistableCommand<any>>;

export function createCommandRegistry() {
	return new Registry<PersistedCommand<string>, PersistableCommand<any>>(
		(persistentCommand) => persistentCommand.itemType
	);
}
