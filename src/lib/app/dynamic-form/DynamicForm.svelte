<script lang="ts">
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import OutputCombo from '$lib/ui/basic-components/OutputCombo.svelte';
	import type { Component } from 'svelte';
	import type { DynamicFormFieldType, DynamicFormSchema } from './dynamic-form-types';

	const {
		schema,
		outputFunc,
		OutputComponent
	}: { schema: DynamicFormSchema; outputFunc: () => any; OutputComponent?: Component } = $props();

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

	let fields = $state(
		schema.map((f) => ({
			...f
		}))
	);

	let fieldValues = $derived(fields.map((f) => f.value ?? defaultValue(f.type)));

	let output = $derived.by(() => {
		if (!fields) return '';
		const params = fieldValues;

		return outputFunc(...params);
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

	{#if OutputComponent}
		<OutputComponent {fieldValues} {outputFunc} />
	{:else}
		<OutputCombo id="output" value={output}>Output</OutputCombo>
	{/if}
</div>

<style>
	.counter-area {
		height: min(400px, 60vh);

		.input-area {
			display: flex;
			flex-direction: column;
		}
	}

	:global(output-combo) {
		position: absolute;
		inset-inline: var(--padding-2);
		bottom: var(--padding-1);

		display: inline-block;
		font-weight: bold;
	}
</style>
