export type DynamicFormSchema = FieldSchema[];
export type DynamicFormFieldType = 'string' | 'number' | 'boolean' | 'date';
export type DynamicFormFieldSchema = {
	name: string;
	type: FieldType;
};
