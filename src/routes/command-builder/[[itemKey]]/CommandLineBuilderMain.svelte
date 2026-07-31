<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { createClickHotKeyAttachment, createFocusHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';

	import CommandBuilder from './CommandBuilder.svelte';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';
	import OneLineForm from './OneLineForm.svelte';
	import DataStateDisplay from './DataStateDisplay.svelte';
	import Debug from './Debug.svelte';
	import type { CbAppEnv } from './command-builder-types';
	import PreventBrowserHotkeys from '$lib/engine/keyboard-navigation/svelte-components/PreventBrowserHotkeys.svelte';
	import { hotkey, hotkeys } from '$lib/engine/hotkeys/hotkey-helpers';

	let { cbAppEnv = $bindable(), ...rest }: { cbAppEnv: CbAppEnv } = $props();

	let isSaveDialogOpen = $state(false);

	let editMode = $derived(cbAppEnv?.editMode ?? 'draft');
	let dataState = $derived(cbAppEnv?.currentDataState);
	let isPermanentCommandPage = $derived(editMode === 'permanent');

	let saveAsErrorMessage = $state('');

	function defaultSaveButtonBehavior() {
		if (isPermanentCommandPage) {
			cbAppEnv?.save();
		} else {
			openSaveAsPopup();
		}
	}

	function openSaveAsPopup() {
		isSaveDialogOpen = true;
	}

	async function deleteItem() {
		await cbAppEnv.delete();
	}

	async function saveAsHandler(newCommandName: string) {
		let result = await cbAppEnv.saveAs(newCommandName);
		if (result.ok) {
			isSaveDialogOpen = false;
		} else {
			const error = result.error;
			if (error.kind === 'Key Already Exists') {
				saveAsErrorMessage = error.message;
			} else {
				saveAsErrorMessage = 'Critical Error - ' + error.message;
			}
		}
	}

	$effect(() => {
		if (!isSaveDialogOpen) {
			saveAsErrorMessage = '';
		}
	});

	const preventedBrowserDefaults = hotkeys([...Array(10).keys()].map(String), 'alt');
</script>

{#if cbAppEnv}
	<Debug appEnv={cbAppEnv} />
	<DataStateDisplay appEnv={cbAppEnv} />
	<PreventBrowserHotkeys preventedKeys={preventedBrowserDefaults} />

	<div class="main-app-layout" {...rest}>
		<main class="command-builder-main-app">
			{#if isPermanentCommandPage}
				<input
					bind:value={cbAppEnv.data.commandName}
					class="input-title"
					{@attach createFocusHotKeyAttachment('Modify Title', hotkey('i', 'alt'))}
				/>
			{/if}

			<CommandBuilder bind:commandBuilderState={cbAppEnv.data} disabled={dataState.kind !== 'ready'} />

			<Button
				class="button-save"
				onclick={defaultSaveButtonBehavior}
				{@attach createClickHotKeyAttachment('Save', false, hotkey('s', 'alt'))}
				>{isPermanentCommandPage ? 'Save' : 'Save As'}</Button
			>

			{#if isPermanentCommandPage}
				<Button
					{@attach createClickHotKeyAttachment('Save As', false, hotkey('s', 'alt', 'shift'))}
					onclick={openSaveAsPopup}
				>
					Save As
				</Button>
				<Button {@attach createClickHotKeyAttachment('Delete', false, hotkey('d', 'alt'))} onclick={deleteItem}>
					Delete
				</Button>
			{/if}
		</main>
	</div>

	<Dialog bind:open={isSaveDialogOpen}>
		<OneLineForm
			title="Save New Command"
			defaultInput="New Command"
			onAction={async (newCommandName) => {
				await saveAsHandler(newCommandName);
			}}
			actionText="Save"
			onClose={() => (isSaveDialogOpen = false)}
			id="save-as-form"
			errorMessage={saveAsErrorMessage}
		/>
	</Dialog>
{/if}

<style lang="scss">
	.main-app-layout {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
	}

	.command-builder-main-app {
		flex-direction: row;
		width: min(600px, 100%);
		position: relative;
		justify-content: end;
	}

	:global(.button-save) {
		margin-top: var(--space-2);
	}

	.input-title {
		display: block;
		width: 100%;
		font-size: var(--font-size-4);
		padding-left: var(--space-2);
		margin-block-end: 4rem;
		color: var(--cl-on-surface);
		border-left: var(--base-border-thick);
	}
</style>
