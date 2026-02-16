<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { untrack } from 'svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import {
		createClickHotKeyAttachment,
		createFocusHotKeyAttachment
	} from '$lib/engine/hotkeys/hotkey-actions';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import CommandBuilder from './CommandBuilder.svelte';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';
	import OneLineForm from './OneLineForm.svelte';
	import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte';
	import { cbRecordAdaper, type CbState } from './command-builder-types';
	import { collectionAppInit } from '$lib/app-infrastructure/collection-app/environement.svelte';
	import { page } from '$app/state';
	import { cbRepo } from './app-repo';

	let placeholderState = {
		commandName: '',
		commandStr: 'Loading...',
		formData: {}
	};

	let draftFallback: CbState = {
		commandName: 'Draft Command',
		commandStr: 'cp -r {src} {dest}',
		formData: {
			src: { value: './origin/', schema: { type: 'string' } },
			dest: { value: './bkp/origin/', schema: { type: 'string' } }
		}
	};

	let cbAppEnv = collectionAppInit<CbState>(
		placeholderState,
		draftFallback,
		cbRecordAdaper,
		cbRepo
	);

	appState.pageContext.title = 'Command Builder';

	let isSaveDialogOpen = $state(false);

	let editMode = $derived(cbAppEnv.editMode);
	let dataState = $derived(cbAppEnv.dataState);
	let isPermanentCommandPage = $derived(editMode === 'permanent');

	let saveAsErrorMessage = $state('');

	$effect(() => {
		track(dataState);

		untrack(() => {
			console.log('Setting Message working state:', dataState);

			if (dataState === 'saving')
				temporaryMessageState.message =
					editMode === 'permanent'
						? `Saving Command [${cbAppEnv.data.commandName}]...`
						: `Saving Draft...`;
		});
	});

	function defaultSaveButtonBehavior() {
		if (isPermanentCommandPage) {
			cbAppEnv.save();
		} else {
			openSaveAsPopup();
		}
	}

	function openSaveAsPopup() {
		isSaveDialogOpen = true;
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
</script>

<div class="mini-app">
	{#if isPermanentCommandPage}
		<input
			bind:value={cbAppEnv.data.commandName}
			class="input-title"
			{@attach createFocusHotKeyAttachment('Modify Title', 'i', 'alt')}
		/>
	{/if}

	<CommandBuilder bind:commandBuilderState={cbAppEnv.data} disabled={dataState !== 'ready'} />

	<Button
		class="button-save"
		onclick={defaultSaveButtonBehavior}
		{@attach createClickHotKeyAttachment('Save', 's', 'alt')}
		>{isPermanentCommandPage ? 'Save' : 'Save As'}</Button
	>

	{#if isPermanentCommandPage}
		<Button
			{@attach createClickHotKeyAttachment('Save As', 's', 'alt', 'shift')}
			onclick={openSaveAsPopup}
		>
			Save As
		</Button>
	{/if}
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

<style lang="scss">
	.mini-app {
		flex-direction: row;
		width: min(600px, 80%);
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
