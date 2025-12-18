<script lang="ts">
	import { createFocusHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import type { Snippet } from 'svelte';

	type HotKeyParams = {
		hotkey: string;
		tooltip: string;
	};

	type InputComboProps = {
		id?: string;
		placeholder?: string;
		value?: any;
		type?: string;
		minLableWidth?: number;
		disabled?: boolean;
		hotkey?: HotKeyParams;
		children?: Snippet;
	};

	let {
		id,
		placeholder,
		type,
		minLableWidth = 0,
		value = $bindable(),
		disabled = false,
		hotkey,
		children,
		...rest
	}: InputComboProps = $props();
</script>

<input-combo>
	<label for={id}
		><span class="prefix" style="min-width: {minLableWidth}">{@render children?.()}</span><span
			class="suffix">:</span
		></label
	>
	<input
		{disabled}
		bind:value
		{type}
		name={id}
		{id}
		{placeholder}
		required
		{@attach hotkey ? createFocusHotKeyAttachment(hotkey.tooltip, hotkey.hotkey, 'alt') : () => {}}
	/>
</input-combo>
