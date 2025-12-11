import type { DynamicFormField } from './dynamic-form-types';

export function resolveFieldValue(field: DynamicFormField) {
	return field.value ?? field.schema.default ?? resolveDefault(field.schema.type);
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
