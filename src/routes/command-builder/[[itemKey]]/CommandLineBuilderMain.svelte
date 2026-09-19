<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';

	import CommandBuilder from './CommandBuilder.svelte';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';
	import OneLineForm from './OneLineForm.svelte';
	import DataStateDisplay from './DataStateDisplay.svelte';
	import Debug from './Debug.svelte';
	import type { CbAppEnv } from './command-builder-types';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { PreventBrowserHotkeys } from '$lib/packages/hotkey-module/svelte';
	import {
		createHotKeyTriggerClickAttachment,
		createHotKeyTriggerFocusAttachment
	} from '$lib/engine/engine-hotkeys/hotkey-actions';
	import { kbKey, kbKeys } from '@svelte-ascend/core';

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

	const preventedBrowserDefaults = kbKeys([...Array(10).keys()].map(String), 'alt');
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
					{@attach createHotKeyTriggerFocusAttachment('Modify Title', kbKey('i', 'alt'))}
				/>
			{/if}

			<CommandBuilder bind:commandBuilderState={cbAppEnv.data} disabled={dataState.kind !== 'ready'} />

			<Button
				class="button-save"
				onclick={defaultSaveButtonBehavior}
				{@attach createHotKeyTriggerClickAttachment('Save', kbKey('s', 'alt'))}
				>{isPermanentCommandPage ? 'Save' : 'Save As'}</Button
			>

			{#if isPermanentCommandPage}
				<Button
					{@attach createHotKeyTriggerClickAttachment('Save As', kbKey('s', 'alt', 'shift'))}
					onclick={openSaveAsPopup}
				>
					Save As
				</Button>
				<Button {@attach createHotKeyTriggerClickAttachment('Delete', kbKey('d', 'alt'))} onclick={deleteItem}
					>Delete</Button
				>
			{/if}
		</main>
	</div>

	<Dialog bind:open={isSaveDialogOpen} dialogController={appState.dialogController}>
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
