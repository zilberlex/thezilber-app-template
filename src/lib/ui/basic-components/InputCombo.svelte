<script lang="ts">
	import { createHotKeyTriggerFocusAttachment } from '$lib/engine/engine-hotkeys/hotkey-actions';
	import { kbKey } from '$lib/packages/core';
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
		thisElement?: HTMLElement;
	};

	let {
		id,
		placeholder,
		type,
		minLableWidth = 0,
		value = $bindable(),
		disabled = false,
		hotkey: hotKeyPramas,
		children,
		thisElement = $bindable(),
		...rest
	}: InputComboProps = $props();
</script>

<input-combo {...rest} bind:this={thisElement}>
	<label for={id}
		><span class="prefix" style="min-width: {minLableWidth}">{@render children?.()}</span><span class="suffix">:</span
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
		{@attach hotKeyPramas
			? createHotKeyTriggerFocusAttachment(hotKeyPramas.tooltip, kbKey(hotKeyPramas.hotkey, 'alt'))
			: () => {}}
	/>
</input-combo>
