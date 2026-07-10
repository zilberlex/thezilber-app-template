import type { MaybePromise, NonEmptyArray } from '$lib/engine/general-js-ts/typescript/type-helpers';
import type { ErrorResult, SuccessResult } from '$lib/engine/patterns/result/types';
import type { PersistedCommand } from '../persistancy/persistent-command';
import type { PipelineCommandFactory } from './pipeline-command-factory';

export type PipelineStep<Deps, Ctx, R = void, E extends Error = Error> = {
	execute: (deps: Deps, ctx: Ctx) => MaybePromise<SuccessResult<R> | ErrorResult<E>>;
	undo: (deps: Deps, ctx: Ctx) => MaybePromise<SuccessResult<R> | ErrorResult<E>>;
	executeError: (deps: Deps, ctx: Ctx, e: E) => MaybePromise<SuccessResult<any> | ErrorResult<E>>;
	undoError?: (deps: Deps, ctx: Ctx, e: E) => MaybePromise<SuccessResult<any> | ErrorResult<E>>;
};

// Pipeline Command
export type PipelineCommandOperationStatus =
	| 'initialized'
	| 'executing'
	| 'executed'
	| 'undoing'
	| 'undone'
	| 'execute-error'
	| 'undo-error';

export type PipelineSteps<Deps, Ctx, E extends Error = Error> = NonEmptyArray<PipelineStep<Deps, Ctx, any, E>>;

export type FullPipelineCtx<PipelineCtx> = {
	opId: number;
	operationStatus: PipelineCommandOperationStatus;
	ctx: PipelineCtx;
};

export type PersistedPipelineCommand<
	CommandType extends string = string,
	PipelineCtx = unknown
> = PersistedCommand<CommandType> & {
	baseCtx: PipelineCtx;
	operationStatusHistory: FullPipelineCtx<PipelineCtx>[];
};

// Factory, Registry, and Command Specs

export type PipelineCtxOf<Spec> = Spec extends PipelineSpec<any, infer Ctx, any> ? Ctx : never;

export type PipelineSpec<Deps, Ctx, E extends Error = Error> = {
	steps: PipelineSteps<Deps, Ctx, E>;
};

export type PipelineSpecs<Deps> = Record<string, PipelineSpec<Deps, any, any>>;

export type PipelineCommandTypeOf<Specs> = Extract<keyof Specs, string>;

export type StepsOf<Spec> = Spec extends { steps: infer Steps } ? Steps : never;

export type AnyPersistedCommandForSpecs<Specs extends PipelineSpecs<any>> = {
	[KCommandType in PipelineCommandTypeOf<Specs>]: PersistedCommandForSpec<Specs, KCommandType>;
}[PipelineCommandTypeOf<Specs>];

export type PersistedCommandForSpec<
	Specs extends PipelineSpecs<any>,
	KCommandType extends PipelineCommandTypeOf<Specs>
> = PersistedPipelineCommand<KCommandType, PipelineCtxOf<Specs[KCommandType]>>;

export type PipelineCommandRegistrySpec<Deps, Specs extends PipelineSpecs<Deps>> = {
	[KCommandType in PipelineCommandTypeOf<Specs>]: {
		input: PersistedCommandForSpec<Specs, KCommandType>;
		output: ReturnType<PipelineCommandFactory<Deps, Specs>['restore']>;
	};
};
