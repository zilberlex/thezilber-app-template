export type AnyNonVoid = Exclude<any, void>;

export type DynamicFormFieldSchema = {
	type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
	required?: boolean;
	default?: unknown;
};

export type DynamicFormSchema = {
	[field: string]: DynamicFormFieldSchema;
};

export type DynamicFormField = {
	value?: unknown;
	schema: DynamicFormFieldSchema;
};

export type DynamicForm = {
	[field: string]: DynamicFormField;
};
