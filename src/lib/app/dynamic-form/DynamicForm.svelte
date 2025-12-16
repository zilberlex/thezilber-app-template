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
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { formFromSchema, mergeForms, resolveFieldValue } from './dynamic-form';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';

	let {
		formSchema,
		outputFunc,
		OutputComponent,
		form = $bindable({})
	} = $props<{
		formSchema: DynamicFormSchema;
		outputFunc: (...args: any[]) => AnyNonVoid;
		OutputComponent?: Component;
		form: DynamicForm;
	}>();

	// 🔹 entries derived directly from state
	let formIterable: [string, DynamicFormField][] = $derived.by(() => Object.entries(form));

	let fieldValues = $derived.by(() =>
		formIterable.map(([, f]) => resolveFieldValue(f as DynamicFormField))
	);

	let output = $derived.by(() => {
		const values = fieldValues;
		return outputFunc(...values);
	});

	$effect(() => {
		track(formSchema);
		untrack(() => {
			form = resolveSchemaChange(form, formSchema);
		});
	});

	function resolveSchemaChange(prevForm: DynamicForm, newSchema: DynamicFormSchema): DynamicForm {
		const incomingForm = formFromSchema(newSchema);
		return mergeForms(prevForm, incomingForm);
	}
</script>

<div class="dynamic-form box box-highlight">
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
					<CopyButtonSimple textToCopy={output} {@attach createClickHotKeyAttachment('c', 'alt')} />
				</div>
				<OutputCombo id="output" value={output}>Output</OutputCombo>
			</div>
		{/if}
	</div>
</div>

<style>
	.dynamic-form {
		display: flex;
		flex-direction: column;

		justify-content: space-between;
		height: min(400px, 60vh);

		.input-area {
			display: flex;
			flex-direction: column;
		}
	}

	.output-container {
		width: 100%;
		position: relative;
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
