type CommandBuilderState = {
	commandStr: string;
	formData: DynamicForm;
};

type PermanentCommandBuilderState = CommandBuilderState & {
	commandName: string;
};

type CommandBuilderData = AppRecord<PermanentCommandBuilderState>;
