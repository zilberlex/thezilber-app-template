import type { AsyncSerialQueue } from '$lib/engine/patterns/async-serial-queue';

export type InsertCtx = {
	insertValue: string;
	undoValue?: string;
	key: string;
};

export type DeleteCtx = {
	key: string;
	originalValue: string;
};

export type ClearCtx = {
	storageState: Map<string, string>;
};

export type DemoCommandDeps = {
	memoryStorage: Map<string, string>;
	farAwayStorage: Map<string, string>;
	farAwayStorageAsyncSerialQueue: AsyncSerialQueue;
};

export type DemoPiplineCtx<StepData> = {
	deps: DemoCommandDeps;
	stepData: StepData;
};
