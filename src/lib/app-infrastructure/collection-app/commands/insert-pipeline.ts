import { errorResult } from '$lib/engine/patterns/result/common';
import { pipelineStep } from '../../../../lib/engine/patterns/command/pipeline/pipeline-step';
import type { CollectionAppContext, CollectionAppError, StoreSaveActionResult } from '../types';
import type { CollectionAppCommandDeps, InsertCtx } from './types';

const logStart = pipelineStep<CollectionAppCommandDeps, InsertCtx, any, CollectionAppError>(
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
			prevDisplayName: prevDisplayName ?? '',
			opId
		});
	},
	(deps, ctx) => {
		const { dataStateDispatcher } = deps;
		const { collectionAppContextSnapshot, optimisticSlug, prevSlug, newDisplayName, prevDisplayName, opId } = ctx;

		dataStateDispatcher.signal({
			kind: 'deleting',
			context: collectionAppContextSnapshot,
			slug: optimisticSlug,
			displayName: newDisplayName,
			opId
		});
	}
);

const insertAsyncPiplineStep = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { collectionAppRepo } = deps;
		const { newDisplayName, collectionAppContextSnapshot, recordToSave } = ctx;

		let createResult = collectionAppRepo.create(collectionAppContextSnapshot, recordToSave.data, newDisplayName);

		try {
			const createRecordResult = await createResult.resultPromise;

			if (!createRecordResult.ok || createRecordResult.value === undefined) {
				// TODO AZ fix freaking result promise and all this shit current returns a promise which returns ActionResult which feels like garbage
				return errorResult(new Error('no create record'));
			}

			ctx.createdRecord = createRecordResult.value;
		} catch (e: any) {
			return errorResult(e);
		}
	},
	async (deps, ctx) => {
		const { collectionAppRepo } = deps;
		const { createdRecord } = ctx;

		if (createdRecord !== undefined) {
			let deleteContext: CollectionAppContext = {
				editMode: 'permanent',
				slug: createdRecord.slug,
				displayName: createdRecord.projection.displayName
			};
			let deleteResult = await collectionAppRepo.delete(deleteContext);

			if (!deleteResult.ok) {
				return errorResult(deleteResult.error);
			}
		} else {
			return errorResult(new Error('Undo Failed, No created record context'));
		}
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
		const { collectionAppCache } = deps;
		const { createdRecord } = ctx;

		if (createdRecord) {
			collectionAppCache.deleteRecord(createdRecord.slug);
		}
	}
);

const updatedCurrentRecord = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { setCurrentAppRecord, currentAppContext } = deps;
		const { createdRecord, collectionAppContextSnapshot } = ctx;

		if (createdRecord) {
			if (currentAppContext().slug === collectionAppContextSnapshot.slug) {
				setCurrentAppRecord(createdRecord);
			}
		}
	},
	async (deps, ctx) => {
		// TODO AZ - some logic is currently located in environment. this is chaos - need apply everything to the pipelien
		// const { createdRecord, collectionAppContextSnapshot } = ctx;
		//
		// if (createdRecord) {
		// 	if (currentAppContext().slug === collectionAppContextSnapshot.slug) {
		// 		contextManager.changeContext();
		// 	}
		// }
	}
);

const returnInsertResult = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	async (deps, ctx) => {
		const { collectionAppContextSnapshot, newDisplayName, createdRecord } = ctx;

		return {
			ok: true,
			value: {
				kind: 'create',
				newSlug: createdRecord?.slug,
				context: collectionAppContextSnapshot,
				newDisplayName
			}
		};
	},
	async (deps, ctx) => {
		// TODO AZ this is also chaos, lets ignore it for now. propbably not needed in undo context
	}
);

const signalEndInsert = pipelineStep<CollectionAppCommandDeps, InsertCtx>(
	(deps, ctx) => {
		const { dataStateDispatcher } = deps;
		const { collectionAppContextSnapshot, optimisticSlug, prevSlug, newDisplayName, prevDisplayName, opId } = ctx;
		// TODO AZ make created state.
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
		const { dataStateDispatcher } = deps;
		const { createdRecord, collectionAppContextSnapshot, newDisplayName, opId } = ctx;

		if (!createdRecord) {
			console.error('Undo signalEndInsert, no createdRecord', ctx);
			return;
		}

		dataStateDispatcher.signal({
			kind: 'deleted',
			context: collectionAppContextSnapshot,
			slug: createdRecord?.slug,
			displayName: newDisplayName,
			opId
		});
	}
);

export const insertSteps = [
	logStart,
	signalStartInsert,
	insertAsyncPiplineStep,
	updateCache,
	updatedCurrentRecord,
	returnInsertResult,
	signalEndInsert,
	logEnd
];
