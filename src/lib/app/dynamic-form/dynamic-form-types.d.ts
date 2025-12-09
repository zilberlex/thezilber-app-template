export type DynamicFormSchema = DynamicFormFieldSchema[];
export type DynamicFormFieldType = 'string' | 'number' | 'boolean' | 'date';
export type DynamicFormFieldSchema = {
	name: string;
	type: FieldType;
};

export type AnyNonVoid = Exclude<any, void>;
