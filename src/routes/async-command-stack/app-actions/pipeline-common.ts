export type DemoPiplineCtx<StepData> = {
	deps: {
		memoryStorage: Map<string, string>;
		farAwayStorage: Map<string, string>;
	};
	stepData: StepData;
};
