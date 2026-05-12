<script lang="ts">
	import { tick } from 'svelte';

	export type EditDetail = {
		prevValue: string;
		newValue: string;
	};

	type Props = {
		value: string;
		editing?: boolean;
		onedit?: (detail: EditDetail) => void;
		oncancel?: () => void;
		class?: string;
		placeholder?: string;
	};

	let {
		value,
		editing = $bindable(false),
		onedit,
		oncancel,
		class: className = '',
		placeholder = ''
	}: Props = $props();

	let draftValue = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (!editing) return;

		draftValue = value;

		tick().then(() => {
			inputEl?.focus();
			inputEl?.select();
		});
	});

	function commit() {
		if (!editing) return;

		const prevValue = value;
		const newValue = draftValue.trim();

		editing = false;
		draftValue = '';

		if (!newValue || newValue === prevValue) return;

		onedit?.({
			prevValue,
			newValue
		});
	}

	function cancel() {
		editing = false;
		draftValue = '';
		oncancel?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit();
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			cancel();
			return;
		}
	}
</script>

{#if editing}
	<input
		bind:this={inputEl}
		class={['inline-name-editor-input', className]}
		bind:value={draftValue}
		{placeholder}
		onblur={commit}
		onkeydown={handleKeydown}
	/>
{:else}
	<span class={['inline-name-editor-label', className]}>
		{value}
	</span>
{/if}

<style>
	.inline-name-editor-label {
		display: block;
		min-inline-size: 0;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.inline-name-editor-input {
		inline-size: 100%;
		min-inline-size: 0;
		box-sizing: border-box;

		border: none;
		outline: none;
		background: transparent;
		color: inherit;
		font: inherit;
	}
</style>
