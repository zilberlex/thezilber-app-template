<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { page, updated } from '$app/state';
	import { onDestroy, untrack } from 'svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { createSmartHandler } from '$lib/engine/events/event-handling';
	import {
		createClickHotKeyAttachment,
		createFocusHotKeyAttachment
	} from '$lib/engine/hotkeys/hotkey-actions';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import CommandBuilder from './CommandBuilder.svelte';
	import { goto } from '$app/navigation';
	import { type Page } from '@sveltejs/kit';
	import { createSyncableData, stampSyncableData } from '$lib/engine/storage/data/data';
	import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
	import { loadCbState, saveCbState, updateCbState } from './command-builder-state-store';
	import type { Initializable } from '$lib/engine/types/utility-types';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import { browser } from '$app/environment';

	let DEFAULT_COMMAND_NAME = 'New Command';

	let justInitialized = true;
	appState.pageContext.title = 'Command Builder';

	let cachedSaveAsCommandName = $state(DEFAULT_COMMAND_NAME);

	let gCbData: Initializable<CommandBuilderData> = $state({
		isInitialized: false,
		data: {
			commandStr: '',
			formData: {}
		}
	} as Initializable<CommandBuilderData>);

	let isPermanentCommandPage = $state(false);
	let gSaveMessage = $derived(
		isPermanentCommandPage ? `Saving Command [${gCbData?.data.commandName}]...` : `Saving Draft...`
	);

	let isSaveDialogOpen = $state(false);

	onDestroy(async () => {
		if (browser) {
			await autoSaveCommandBuilderDataHandler(null);
		}
	});

	$effect(() => {
		if (isSaveDialogOpen) {
			untrack(() => {
				cachedSaveAsCommandName ||= DEFAULT_COMMAND_NAME;
			});
		}
	});

	let isSaving = $state(false);

	function getPathWithoutParams(page: Page) {
		return page.route.id ? page.route.id.replace(/\/[^/]+$/, '') : page.url.pathname;
	}

	$effect(() => {
		console.log(
			'Page Loaded route',
			page.route,
			'page.route.id',
			page.route.id,
			'params:',
			page.params
		);
		track(page);

		untrack(async () => {
			console.log('page', $state.snapshot(page));

			await loadPageState(page);
			console.log('loaded page state', $state.snapshot(gCbData));
		});
	});

	$effect(() => {
		track(gCbData.data);
		untrack(async () => {
			autoSaveCommandBuilderDataHandler(null);
		});
	});

	async function loadPageState(page: Page) {
		let paramsCommandName = page.params.commandName;
		let loadedState: CommandBuilderData | undefined;

		if (paramsCommandName) {
			// PermanentCommandPage
			let commandName = paramsCommandName;
			isPermanentCommandPage = true;
			let storedCommand = await loadCbState({
				kind: 'permanent',
				commandName: commandName
			});

			console.log('Loading Permanent Command', commandName);
			if (!storedCommand) {
				const redirectPath = getPathWithoutParams(page);
				console.warn(`CommandName [${paramsCommandName}] not found. Rerouting [${redirectPath}]`);

				return await goto(redirectPath, { replaceState: true, invalidateAll: true });
			} else {
				loadedState = storedCommand;
			}
		} else {
			// Load Temporary Command
			console.log('Loading Draft Command');
			loadedState = await loadCbState({
				kind: 'draft'
			});

			if (!loadedState?.data?.commandStr) {
				const exampleForm = getExampleCommand() as PermanentCommandBuilderState;
				loadedState = createSyncableData(getDeviceId(), exampleForm);
			}

			loadedState.data.commandName = DEFAULT_COMMAND_NAME;
		}

		if (!loadedState) throw new Error('Failed to Initialize Data');

		gCbData = {
			...loadedState,
			isInitialized: true
		};
	}

	function saveCommandBuilderData() {
		if (justInitialized) {
			if (gCbData.isInitialized) {
				justInitialized = false;
			}
			return;
		}

		console.log('Saving data', $state.snapshot(gCbData));

		stampSyncableData(getDeviceId(), gCbData);
		let command = $state.snapshot(gCbData);

		if (isPermanentCommandPage) {
			updateCbState({ kind: 'permanent', saveData: command });
		} else {
			updateCbState({ kind: 'draft', saveData: command });
		}

		isSaving = true;
		setTimeout(() => {
			isSaving = false;
		}, 1000);
	}

	async function saveNewCommand(commandName: string) {
		let newCommand = $state.snapshot(gCbData);
		newCommand.data.commandName = commandName;
		await saveCbState({ kind: 'permanent', saveData: newCommand });

		let basePath = getPathWithoutParams(page);
		await goto(`${basePath}/${newCommand.data.commandName}`);
	}

	let autoSaveCommandBuilderDataHandler = createSmartHandler(saveCommandBuilderData, {
		cooldownDelay: 0,
		debounceDelay: 2000
	});

	function getExampleCommand(): CommandBuilderState {
		const commandStr = 'cp -r {src} {dest}';
		const formData = {
			src: {
				value: './origin/',
				schema: { type: 'string' }
			},
			dest: {
				value: './bkp/origin/',
				schema: { type: 'string' }
			}
		};

		return { commandStr, formData };
	}

	function defaultSaveButtonBehavior() {
		if (isPermanentCommandPage) {
			saveCommandBuilderData();
		} else {
			openSaveAsPopup();
		}
	}

	function openSaveAsPopup() {
		isSaveDialogOpen = true;
	}
</script>

<div class="save-indicator" class:show={isSaving}>{gSaveMessage}</div>

<div class="mini-app">
	{#if isPermanentCommandPage}
		<input
			bind:value={gCbData.data.commandName}
			class="input-title"
			{@attach createFocusHotKeyAttachment('Modify Title', 'i', 'alt')}
		/>
	{/if}
	<CommandBuilder bind:commandBuilderState={gCbData.data} />

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
	<form class="save-as-dialog box">
		<h3 class="save-as-dialog-title">Save New Command</h3>
		<div class="save-as-dialog-content">
			<InputCombo bind:value={cachedSaveAsCommandName} hotkey={{ hotkey: '1', tooltip: 'Input' }}
				>Command Name</InputCombo
			>
		</div>
		<div class="save-as-dialog-controls">
			<Button onclick={() => saveNewCommand(cachedSaveAsCommandName)}>Save</Button>
			<Button
				onclick={() => (isSaveDialogOpen = false)}
				{@attach createClickHotKeyAttachment('Close Dialog', 'q', 'alt')}>Close</Button
			>
		</div>
	</form>
</Dialog>

<style lang="scss">
	.mini-app {
		flex-direction: row;
		width: min(600px, 80%);
		position: relative;
		justify-content: end;
	}

	.save-indicator {
		opacity: 0;
		position: absolute;
		top: var(--space-1);
		right: var(--space-1);
		transition: opacity 500ms;
	}

	:global(.button-save) {
		margin-top: var(--space-2);
	}

	.show {
		opacity: 1;
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

	.save-as-dialog {
		display: flex;
		flex-direction: column;
		padding: var(--space-2);

		.save-as-dialog-title {
			margin-bottom: var(--space-4);
		}

		.save-as-dialog-content {
			margin-bottom: var(--space-8);
		}

		.save-as-dialog-controls {
			display: flex;
			flex-direction: row-reverse;
			gap: var(--space-3);
		}
	}
</style>
