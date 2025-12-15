import type { DynamicForm, DynamicFormField, DynamicFormSchema } from './dynamic-form-types';

export function resolveFieldValue(field: DynamicFormField) {
	return field.value ?? field.schema.default ?? resolveDefault(field.schema.type);
}

export function formFromSchema(schema: DynamicFormSchema): DynamicForm {
	const next: DynamicForm = {};

	for (const [fieldName, fieldSchema] of Object.entries(schema)) {
		next[fieldName] = {
			schema: fieldSchema
		};
	}

	return next;
}

export function mergeForms(currentForm: DynamicForm, incoming: DynamicForm): DynamicForm {
	const newForm: DynamicForm = {};

	for (const [fieldName, incomingField] of Object.entries(incoming)) {
		const prevField = currentForm[fieldName];
		const mergedField: DynamicFormField = { schema: incomingField.schema };

		const prevVal = prevField?.value;
		const incomingVal = incomingField.value;

		mergedField.value = incomingVal !== undefined ? incomingVal : prevVal;

		newForm[fieldName] = mergedField;
	}

	return newForm;
}

function resolveDefault(type: string) {
	switch (type) {
		case 'string':
			return '';
		case 'number':
			return 0;
		case 'boolean':
			return false;
		default:
			return '';
	}
}
