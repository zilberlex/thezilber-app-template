import type { CommandRegistry } from '../persistancy/command-registry';
import { pipelineCommand } from './pipeline-command';
import type { AnyPersistedCommandForSpecs, PipelineCommandTypeOf, PipelineCtxOf, PipelineSpecs } from './types';

export function definePipelineSpecs<Deps>() {
	return <const Specs extends PipelineSpecs<Deps>>(specs: Specs) => specs;
}

export class PipelineCommandFactory<Deps, Specs extends PipelineSpecs<Deps>> {
	#deps: Deps;
	#specs: Specs;

	constructor(deps: Deps, specs: Specs) {
		this.#deps = deps;
		this.#specs = specs;
	}

	create<K extends PipelineCommandTypeOf<Specs>>(commandType: K, ctx: PipelineCtxOf<Specs[K]>) {
		const spec = this.#specs[commandType];

		return pipelineCommand(commandType, this.#deps, ctx, spec.steps);
	}

	restore(persistedCommand: AnyPersistedCommandForSpecs<Specs>) {
		const command = this.create(persistedCommand.itemType, persistedCommand.baseCtx);

		command.hydrateCommand(persistedCommand);

		return command;
	}

	registerInto(commandRegistry: CommandRegistry) {
		for (const commandType of Object.keys(this.#specs) as Array<PipelineCommandTypeOf<Specs>>) {
			commandRegistry.register(commandType, (persistedCommand) =>
				this.restore(persistedCommand as AnyPersistedCommandForSpecs<Specs>)
			);
		}
	}
}
