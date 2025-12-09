<script lang="ts">
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import OutputCombo from '$lib/ui/basic-components/OutputCombo.svelte';
	import type { Component } from 'svelte';
	import type { AnyNonVoid, DynamicFormFieldType, DynamicFormSchema } from './dynamic-form-types';
	import CopyButtonSimple from '$lib/ui/components/CopyButtonSimple.svelte';

	let {
		schema,
		outputFunc,
		OutputComponent
	}: {
		schema: DynamicFormSchema;
		outputFunc: (...args: any[]) => AnyNonVoid;
		OutputComponent?: Component;
	} = $props();

	const defaultValue = (type: DynamicFormFieldType) => {
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
	};

	type Field = DynamicFormFieldType & { value?: any };

	let fields: Field[] = $state([]);

	$effect(() => {
		fields =
			schema?.map((f) => ({
				...f
			})) ?? [];
	});

	let fieldValues = $derived(fields?.map((f) => f.value ?? defaultValue(f.type)));

	let output = $derived.by(() => {
		if (!fields) return '';
		const rest = fieldValues;

		return outputFunc(...rest);
	});
</script>

<div class="counter-area box box-highlight">
	<div class="input-area">
		{#each fields as field}
			<InputCombo
				type={field.type}
				placeholder={defaultValue(field.type).toString()}
				bind:value={field.value}
				id={field.name}>{field.name}</InputCombo
			>
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
