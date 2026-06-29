import type { AsyncCommandInterface } from '../../../../../routes/async-command-stack/commands/async-command';
import type { PeristentCommand } from '../../../../../routes/async-command-stack/pipeline/pipeline-command';
import type { Command } from '../command';

type CommandCreationFunction<T = void> = (peristentCommand: PeristentCommand<T>) => Command | AsyncCommandInterface<T>;

export class CommandRegistry {
	#constructionMap = new Map<string, CommandCreationFunction<any>>();

	register<T>(commandType: string, createCommand: CommandCreationFunction<T>) {
		this.#constructionMap.set(commandType, createCommand);
	}

	// TODO AZ improve generic getting via map magic or sth
	createCommand<T>(peristentCommand: PeristentCommand<T>) {
		const createFunc = this.#constructionMap.get(peristentCommand.commandType);

		if (!createFunc) return;

		return createFunc(peristentCommand) as Command | AsyncCommandInterface<T>;
	}
}
