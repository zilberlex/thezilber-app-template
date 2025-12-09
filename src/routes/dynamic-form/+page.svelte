<script lang="ts">
	import type { DynamicFormSchema } from '$lib/app/dynamic-form/dynamic-form-types';
	import DynamicForm from '$lib/app/dynamic-form/DynamicForm.svelte';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import { tokenize, type Token } from './custom-tokenizer';

	let commandStr = $state('');

	let tokens = $derived(tokenize(commandStr));
	let dynamicFormSchema = $derived(extractSchema(tokens));

	type ParamSchema = {
		name: string;
		type: 'string';
	};

	function extractSchema(tokens: Token[]): DynamicFormSchema {
		const result: ParamSchema[] = [];

		for (const t of tokens) {
			if (t.kind === 'param') {
				result.push({
					name: t.name,
					type: 'string'
				});
			}
		}

		return result;
	}

	function constructCommandFromFields(
		tokens: Token[],
		schema: DynamicFormSchema,
		fields: string[]
	): string {
		let parts: string[] = [];

		let i = 0;
		tokens.forEach((token) => {
			if (token.kind === 'text') {
				parts.push(token.value);
			} else {
				// parts.push(fields.length > i ? fields[i++] : '');
				const field = fields[i];
				parts.push(field ? field : `[FILL:${schema[i].name}]`);
				i++;
			}
		});

		return parts.join('');
	}
</script>

<div class="mini-app">
	<InputCombo
		placeholder={'Enter Command here, use squirly braces for {field}'}
		bind:value={commandStr}>Command String</InputCombo
	>
	<DynamicForm
		schema={dynamicFormSchema}
		outputFunc={(...fields) => constructCommandFromFields(tokens, dynamicFormSchema, fields)}
		displayCopy={true}
	/>
</div>

<style lang="scss">
	.mini-app {
		width: min(600px, 80%);
		position: relative;
	}
</style>
