<script lang="ts">
	import type { DynamicFormSchema } from '$lib/app/dynamic-form/dynamic-form-types';
	import DynamicForm from '$lib/app/dynamic-form/DynamicForm.svelte';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import { onMount, untrack } from 'svelte';
	import { tokenize, type Token } from './custom-tokenizer';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { loadState, saveState } from '$lib/engine/storage/local/local-storage-repository';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { createSmartHandler } from '$lib/engine/events/event-handling';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';

	const PersistanceStateKey = 'DynamicForm';

	let commandStr = $state('');
	let isSaving = $state(false);

	let tokens = $derived(tokenize(commandStr));
	let formSchema = $derived.by(() => {
		let newSchema = extractSchema(tokens);
		return newSchema;
	});

	let form: DynamicForm = $state({});

	onMount(() => {
		let dynamicFormState = loadDynamicFormState();
		if (dynamicFormState) {
			commandStr = dynamicFormState.commandStr;
			form = dynamicFormState.formData;
		}
	});

	$effect(() => {
		track(form);
		untrack(() => {
			saveDynamicFormStateAutoHandler(null);
		});
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

	type DynamicFormPageState = {
		commandStr: string;
		formData: DynamicForm;
	};

	function loadDynamicFormState(): DynamicFormPageState | undefined {
		return loadState(PersistanceStateKey);
	}

	function saveDynamicFormState() {
		let dynamicFormState: DynamicFormPageState = {
			commandStr,
			formData: $state.snapshot(form)
		};

		isSaving = true;
		setTimeout(() => {
			isSaving = false;
		}, 1000);

		saveState(PersistanceStateKey, dynamicFormState);
	}

	let saveDynamicFormStateAutoHandler = createSmartHandler(saveDynamicFormState, {
		cooldownDelay: 0,
		debounceDelay: 2000
	});
</script>

<div class="save-indicator" class:show={isSaving}>Saving...</div>
<div class="mini-app">
	<InputCombo
		placeholder={'Enter Command here, use squirly braces for {field}'}
		bind:value={commandStr}>Command String</InputCombo
	>
	<DynamicForm
		{formSchema}
		outputFunc={(...fields) => constructTextCommandFromFields(tokens, formSchema, fields)}
		bind:form
	/>
	<Button
		class="button-save"
		onclick={saveDynamicFormState}
		{@attach createClickHotKeyAttachment('Save', 's', 'alt')}>Save</Button
	>
</div>

<style lang="scss">
	.mini-app {
		width: min(600px, 80%);
		position: relative;
	}

	.save-indicator {
		opacity: 0;
		position: absolute;
		top: var(--space-xs);
		right: var(--space-xs);
		transition: opacity 500ms;
	}

	:global(.button-save) {
		margin-top: var(--space-sm);
	}

	.show {
		opacity: 1;
	}
</style>
