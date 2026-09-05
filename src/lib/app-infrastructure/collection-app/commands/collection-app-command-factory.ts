import { AsyncSerialQueue } from '$lib/engine/patterns/async-serial-queue';
import type { CommandRegistry } from '$lib/engine/patterns/command/persistancy/command-registry';
import {
	definePipelineSpecs,
	PipelineCommandFactory
} from '$lib/engine/patterns/command/pipeline/pipeline-command-factory';
import type { CollectionAppCache } from '../collectionAppCache.svelte';
import type { DataProjection } from '../data/types';
import type {
	CollectionAppContext,
	CollectionAppDataStateDispatcher,
	CollectionAppRecord,
	CollectionAppRepo
} from '../types';
import { insertSteps } from './insert-pipeline';
import type { CollectionAppCommandDeps, InsertCtx } from './types';

const CollectionAppCommandSpecs = definePipelineSpecs<CollectionAppCommandDeps>()({
	'collection-app-insert-command': {
		steps: insertSteps
	}
});

export type CollectionAppCommandType = keyof typeof CollectionAppCommandSpecs;

export class CollectionAppCommandFactory {
	// collectionAppRepo: CollectionAppRepo<unknown, unknown extends DataProjection>;
	// collectionAppCache: CollectionAppCache<unknown, unknown extends DataProjection>;
	// setCurrentAppRecord: (record: CollectionAppRecord<unknown, unknown extends DataProjection>) => void;
	// dataStateDispatcher: CollectionAppDataStateDispatcher;
	// currentAppContext: () => CollectionAppContext;
	//

	#factory: PipelineCommandFactory<CollectionAppCommandDeps, typeof CollectionAppCommandSpecs>;

	constructor(
		commandRegistry: CommandRegistry,
		collectionAppRepo: CollectionAppRepo<unknown, any>,
		collectionAppCache: CollectionAppCache<unknown, any>,
		setCurrentAppRecord: (record: CollectionAppRecord<unknown, any>) => void,
		dataStateDispatcher: CollectionAppDataStateDispatcher,
		currentAppContext: () => CollectionAppContext
	) {
		// todo az add the serial queue
		let serialQueue = new AsyncSerialQueue();
		this.#factory = new PipelineCommandFactory(
			{ collectionAppRepo, collectionAppCache, setCurrentAppRecord, dataStateDispatcher, currentAppContext },
			CollectionAppCommandSpecs
		);

		this.#factory.registerInto(commandRegistry);
	}

	insertCommand(ctx: InsertCtx) {
		return this.#factory.create('collection-app-insert-command', ctx);
	}

	// 	updateCommand(ctx: UpdateCtx) {
	// 		return this.#factory.create('demo-update-command', ctx);
	// 	}
	//
	// 	deleteCommand(ctx: DeleteCtx) {
	// 		return this.#factory.create('demo-delete-command', ctx);
	// 	}
	//
	// 	clearCommand(ctx: ClearCtx) {
	// 		return this.#factory.create('demo-clear-command', ctx);
	// 	}
}
