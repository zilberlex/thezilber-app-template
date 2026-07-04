export type DemoCommandDeps = {
	memoryStorage: Map<string, string>;
	farAwayStorage: Map<string, string>;
};

export type DemoPiplineCtx<StepData> = {
	deps: DemoCommandDeps;
	stepData: StepData;
};
