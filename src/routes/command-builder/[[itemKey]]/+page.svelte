<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { page } from '$app/state';
	import { onDestroy, untrack } from 'svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import {
		createClickHotKeyAttachment,
		createFocusHotKeyAttachment
	} from '$lib/engine/hotkeys/hotkey-actions';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import CommandBuilder from './CommandBuilder.svelte';
	import { goto } from '$app/navigation';
	import { type Page } from '@sveltejs/kit';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';
	import { browser } from '$app/environment';
	import OneLineForm from './OneLineForm.svelte';
	import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte';
	import type { PageData } from './$types';

	let { data: cbAppContext }: { data: PageData } = $props();

	const recordManager = $derived(cbAppContext.recordManager);
	appState.pageContext.title = 'Command Builder';

	let isSaveDialogOpen = $state(false);

	let commandBuilderData = $derived(recordManager.recordData);
	let editMode = $derived(cbAppContext.editMode);
	let isPermanentCommandPage = $derived(editMode === 'permanent');

	onDestroy(async () => {
		if (browser) {
			await recordManager?.save();
		}
	});

	function getPathWithoutParams(page: Page) {
		return page.route.id ? page.route.id.replace(/\/[^/]+$/, '') : page.url.pathname;
	}

	$effect(() => {
		console.log('Setting Message working state:', recordManager.workingSate);
		track(recordManager.workingSate);

		// TODO AZ Figure out why causes this loop and forcing me untrack
		untrack(() => {
			if (recordManager.workingSate === 'saving')
				temporaryMessageState.message =
					editMode === 'permanent'
						? `Saving Command [${commandBuilderData.commandName}]...`
						: `Saving Draft...`;
		});
	});

	async function saveNewCommand(commandName: string) {
		let newCommand = $state.snapshot(commandBuilderData);

		newCommand.commandName = commandName;

		try {
			await recordManager.saveAs(commandName);
			let basePath = getPathWithoutParams(page);
			console.log('recordManager new Data', $state.snapshot(recordManager.recordData));
			await goto(`${basePath}/${commandName}`);
		} catch (e) {
			temporaryMessageState.setMessageWithTimout(
				`Failed to save command [${commandName}] error message: ${e.message}`,
				15000
			);
		}
	}

	function defaultSaveButtonBehavior() {
		if (editMode === 'permanent') {
			recordManager?.save();
		} else {
			openSaveAsPopup();
		}
	}

	function openSaveAsPopup() {
		isSaveDialogOpen = true;
	}

	$effect(() => {
		appState.debug.viewObject = commandBuilderData;
	});
</script>

<div class="mini-app">
	{#if isPermanentCommandPage}
		<input
			bind:value={commandBuilderData.commandName}
			class="input-title"
			{@attach createFocusHotKeyAttachment('Modify Title', 'i', 'alt')}
		/>
	{/if}
	<CommandBuilder bind:commandBuilderState={commandBuilderData} />

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
		onAction={(input) => saveNewCommand(input)}
		actionText="Save"
		onClose={() => (isSaveDialogOpen = false)}
		id="save-as-form"
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
