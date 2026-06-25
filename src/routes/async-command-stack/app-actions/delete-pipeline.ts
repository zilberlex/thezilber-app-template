import { pipelineStep } from '../pipeline/pipeline-step';

type DeleteCtx = {
	key: string;
	originalValue: string;
};

const startingStep = pipelineStep(
	(ctx: DeleteCtx) => {},
	(ctx: DeleteCtx) => {}
);
