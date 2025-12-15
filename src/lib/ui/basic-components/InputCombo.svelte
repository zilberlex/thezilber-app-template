<script lang="ts">
	import type { Snippet } from 'svelte';

	type InputComboProps = {
		id?: string;
		placeholder?: string;
		value?: any;
		type?: string;
		minLableWidth?: number;
		disabled: boolean;
		children?: Snippet;
	};

	let {
		id,
		placeholder,
		type,
		minLableWidth = 0,
		value = $bindable(),
		disabled = false,
		children
	}: InputComboProps = $props();
</script>

<input-combo>
	<label for={id}
		><span class="prefix" style="min-width: {minLableWidth}">{@render children?.()}</span><span
			class="suffix">:</span
		></label
	>
	<input {disabled} bind:value {type} name={id} {id} {placeholder} required />
</input-combo>
