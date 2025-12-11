<script lang="ts">
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import OutputCombo from '$lib/ui/basic-components/OutputCombo.svelte';
	import CopyButtonSimple from '$lib/ui/components/CopyButtonSimple.svelte';

	import { untrack, type Component } from 'svelte';
	import type {
		AnyNonVoid,
		DynamicForm,
		DynamicFormField,
		DynamicFormSchema
	} from './dynamic-form-types';
	import { track } from '$lib/engine/svelte-helpers/track';
	import { resolveFieldValue } from './dynamic-form';

	let { formInput, outputFunc, OutputComponent } = $props<{
		formInput: DynamicFormSchema | DynamicForm;
		outputFunc: (...args: any[]) => AnyNonVoid;
		OutputComponent?: Component;
	}>();

	let form = $state<DynamicForm>(resolveIncomingForm({}, formInput));

	$effect(() => {
		track(formInput);
		untrack(() => {
			form = resolveIncomingForm(form, formInput);
		});
	});

	// 🔹 entries derived directly from state
	let formIterable = $derived.by(() => Object.entries(form));

	let fieldValues = $derived.by(() => formIterable.map(([, f]) => resolveFieldValue(f)));

	let output = $derived.by(() => {
		const values = fieldValues;
		return outputFunc(...values);
	});

	function resolveIncomingForm(
		prev: DynamicForm,
		input: DynamicForm | DynamicFormSchema
	): DynamicForm {
		const incomingForm = isForm(input) ? input : formFromSchema(input);
		return mergeForms(prev, incomingForm);
	}

	function formFromSchema(schema: DynamicFormSchema): DynamicForm {
		const next: DynamicForm = {};

		for (const [fieldName, fieldSchema] of Object.entries(schema)) {
			next[fieldName] = {
				schema: fieldSchema
			};
		}

		return next;
	}

	function mergeForms(currentForm: DynamicForm, incoming: DynamicForm): DynamicForm {
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

	function isForm(input: DynamicForm | DynamicFormSchema): input is DynamicForm {
		const values = Object.values(input);
		if (values.length === 0) return false;

		const first = values[0];
		return typeof first === 'object' && first !== null && 'schema' in first;
	}
</script>

<div class="counter-area box box-highlight">
	<div class="input-area">
		{#each formIterable as [fieldName, dynamicFormField] (fieldName)}
			<InputCombo
				type={dynamicFormField.schema.type}
				placeholder={resolveFieldValue(dynamicFormField).toString()}
				bind:value={dynamicFormField.value}
			>
				{fieldName}
			</InputCombo>
		{/each}
	</div>

	<div class="output-container">
		{#if OutputComponent}
			<OutputComponent {fieldValues} {outputFunc} />
		{:else}
			<div class="overlay-wrapper">
				<div class="copy-button">
					<CopyButtonSimple textToCopy={output} />
				</div>
				<OutputCombo id="output" value={output}>Output</OutputCombo>
			</div>
		{/if}
	</div>
</div>

<style>
	.counter-area {
		height: min(400px, 60vh);

		.input-area {
			display: flex;
			flex-direction: column;
		}
	}

	.output-container {
		position: absolute;
		inset-inline: var(--padding-2);
		bottom: var(--padding-1);
		font-weight: bold;
	}

	:global(output-combo) {
		display: inline-block;
	}

	.overlay-wrapper {
		position: relative;
	}

	.copy-button {
		position: absolute;
		display: inline-block;
		right: var(--padding-2);
	}
</style>
