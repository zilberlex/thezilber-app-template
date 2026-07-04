import type { AsyncCommandInterface } from '../commands/async-command';
import type { PersistentCommand } from './pipeline-command';
import type { Command } from '../../../lib/engine/patterns/command/command';
import { Registry } from './registry';

export type RestoredCommand = Command | AsyncCommandInterface<any>;

export type CommandRegistry = Registry<PersistentCommand<string, unknown>, RestoredCommand>;

export function createCommandRegistry() {
	return new Registry<PersistentCommand<string, unknown>, RestoredCommand>(
		(persistentCommand) => persistentCommand.commandType
	);
}
