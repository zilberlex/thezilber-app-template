import { errorResult } from '$lib/engine/patterns/result/common';
import { pipelineStep } from '../../../../lib/engine/patterns/command/pipeline/pipeline-step';
import type { CollectionAppCommandDeps, InsertCtx } from './types';

const logStart = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	(_deps, ctx) => {
		console.log('Inserting New Record', ctx);
	},
	(_deps, ctx) => {
		console.log('Undoing Insert New Record', ctx);
	},
	(_deps, ctx, e) => {
		console.error('Insert Failed', {
			ctx,
			error: e
		});
	},
	(_deps, ctx, e) => {
		console.error('Insert Undo Failed', {
			ctx,
			error: e
		});
	}
);

const logEnd = pipelineStep(
	(_deps: CollectionAppCommandDeps, ctx: InsertCtx) => {
		console.log('Successfully Inserted New Record', ctx);
	},
	(_deps: CollectionAppCommandDeps, ctx: InsertCtx) => {
		console.log('Successfully Undone New Record', ctx);
	}
);

const signalStartInsert = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	(deps, ctx) => {
		const { dataStateDispatcher } = deps;
		const { collectionAppContextSnapshot, optimisticSlug, prevSlug, newDisplayName, prevDisplayName, opId } = ctx;
		dataStateDispatcher.signal({
			kind: 'creating',
			context: collectionAppContextSnapshot,
			slug: optimisticSlug,
			prevSlug: prevSlug,
			displayName: newDisplayName,
			prevDisplayName: prevDisplayName,
			opId
		});
	},
	(deps, ctx) => {
		// TODO AZ
	}
);

const insertAsyncPiplineStep = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { collectionAppRepo } = deps;
		const { newDisplayName, collectionAppContextSnapshot, recordToSave } = ctx;

		let createResult = collectionAppRepo.create(collectionAppContextSnapshot, recordToSave.data, newDisplayName);

		try {
			const createRecord = await createResult.resultPromise;

			if (createRecord === undefined) {
				return errorResult(new Error('no create record'));
			}

			ctx.createdRecord = createRecord;
		} catch (e: Error) {
			return errorResult(e);
		}
	},
	async (deps, ctx) => {
		// TODO AZ
	}
);

const updateCache = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { collectionAppCache } = deps;
		const { createdRecord } = ctx;

		if (createdRecord) {
			collectionAppCache.updateRecordCache(createdRecord);
		}
	},
	async (deps, ctx) => {
		// TODO AZ
	}
);

const updatedCurrentRecord = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { setCurrentAppRecord, currentAppContext } = deps;
		const { createdRecord, relevantContext } = ctx;

		if (createdRecord) {
			if (currentAppContext().slug === relevantContext.slug) {
				setCurrentAppRecord(createdRecord);
			}
		}
	},
	async (deps, ctx) => {
		// TODO AZ
	}
);

const returnInsertResult = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { relevantContext, newDisplayName, recordToSave } = ctx;

		return {
			ok: true,
			value: {
				kind: 'create',
				newSlug: recordToSave.slug,
				context: relevantContext,
				newDisplayName
			}
		};
	},
	async (deps, ctx) => {
		// TODO AZ
	}
);

const signalEndInsert = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	(deps, ctx) => {
		const { dataStateDispatcher } = deps;
		const { collectionAppContextSnapshot, optimisticSlug, prevSlug, newDisplayName, prevDisplayName, opId } = ctx;
		dataStateDispatcher.signal({
			kind: 'ready',
			context: collectionAppContextSnapshot,
			slug: optimisticSlug,
			prevSlug: prevSlug,
			displayName: newDisplayName,
			prevDisplayName: prevDisplayName,
			opId
		});
	},
	(deps, ctx) => {
		// TODO AZ
	}
);

export const insertSteps = [
	logStart,
	signalStartInsert,
	insertAsyncPiplineStep,
	updateCache,
	updatedCurrentRecord,
	signalEndInsert,
	logEnd
];
