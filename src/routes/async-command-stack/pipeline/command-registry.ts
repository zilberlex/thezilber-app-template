import type { AsyncCommandInterface } from '../../../lib/engine/patterns/command/async-command';
import type { PersistentCommand } from './pipeline-command';
import type { CommandInterface } from '../../../lib/engine/patterns/command/command';
import { Registry } from './registry';

export type RestoredCommand = CommandInterface | AsyncCommandInterface<any>;

export type CommandRegistry = Registry<PersistentCommand<string, unknown>, RestoredCommand>;

export function createCommandRegistry() {
	return new Registry<PersistentCommand<string, unknown>, RestoredCommand>(
		(persistentCommand) => persistentCommand.commandType
	);
}
