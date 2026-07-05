import type { CommandRegistry } from '../persistancy/command-registry';
import { pipelineCommand, type PersistedPipelineCommand, type PipelineSteps } from './pipeline-command';

export type PipelineSpec<Deps, Ctx, E extends Error = Error> = {
	steps: PipelineSteps<Deps, Ctx, E>;
};

export type PipelineSpecs<Deps> = Record<string, PipelineSpec<Deps, any, any>>;

type CtxOf<Spec> = Spec extends PipelineSpec<any, infer Ctx, any> ? Ctx : never;

export type PipelineCommandTypeOf<Specs> = Extract<keyof Specs, string>;

export type AnyPersistedCommandForSpecs<Specs extends PipelineSpecs<any>> = {
	[KCommandType in PipelineCommandTypeOf<Specs>]: PersistedCommandForSpec<Specs, KCommandType>;
}[PipelineCommandTypeOf<Specs>];

export type PersistedCommandForSpec<
	Specs extends PipelineSpecs<any>,
	KCommandType extends PipelineCommandTypeOf<Specs>
> = PersistedPipelineCommand<KCommandType, CtxOf<Specs[KCommandType]>>;

export function definePipelineSpecs<Deps>() {
	return <const Specs extends PipelineSpecs<Deps>>(specs: Specs) => specs;
}

export type PipelineCommandRegistrySpec<Deps, Specs extends PipelineSpecs<Deps>> = {
	[KCommandType in PipelineCommandTypeOf<Specs>]: {
		input: PersistedCommandForSpec<Specs, KCommandType>;
		output: ReturnType<PipelineCommandFactory<Deps, Specs>['restore']>;
	};
};

export class PipelineCommandFactory<Deps, Specs extends PipelineSpecs<Deps>> {
	#deps: Deps;
	#specs: Specs;

	constructor(deps: Deps, specs: Specs) {
		this.#deps = deps;
		this.#specs = specs;
	}

	create<K extends PipelineCommandTypeOf<Specs>>(commandType: K, ctx: CtxOf<Specs[K]>) {
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
