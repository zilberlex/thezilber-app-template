<script lang="ts">
	import type { DynamicFormSchema } from '$lib/app/dynamic-form/dynamic-form-types';
	import DynamicForm from '$lib/app/dynamic-form/DynamicForm.svelte';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import { tokenize, type Token } from './custom-tokenizer';

	let { commandBuilderState = $bindable() }: { commandBuilderState: CommandBuilderState } =
		$props();

	let tokens = $derived(tokenize(commandBuilderState.commandStr));
	let formSchema = $derived.by(() => {
		let newSchema = extractSchema(tokens);
		return newSchema;
	});

	function extractSchema(tokens: Token[]): DynamicFormSchema {
		const result: DynamicFormSchema = {};

		for (const t of tokens) {
			if (t.kind === 'param') {
				result[t.name] = {
					type: 'string'
				};
			}
		}

		return result;
	}

	function constructTextCommandFromFields(
		tokens: Token[],
		schema: DynamicFormSchema,
		fields: string[]
	): string {
		let schemaEntries = Object.entries(schema);
		let parts: string[] = [];

		let formSchemIndex = 0;
		tokens.forEach((token) => {
			if (token.kind === 'text') {
				parts.push(token.value);
			} else {
				// parts.push(fields.length > i ? fields[i++] : '');
				const field = fields[formSchemIndex];
				parts.push(field ? field : `[FILL:${schemaEntries[formSchemIndex][0]}]`);
				formSchemIndex++;
			}
		});

		return parts.join('');
	}
</script>

<InputCombo
	hotkey={{ hotkey: '0', tooltip: 'Modify Command' }}
	placeholder={'Enter Command here, use squirly braces for {field}'}
	bind:value={commandBuilderState.commandStr}>Command String</InputCombo
>
<DynamicForm
	{formSchema}
	outputFunc={(...fields: any[]) => constructTextCommandFromFields(tokens, formSchema, fields)}
	bind:form={commandBuilderState.formData}
/>
