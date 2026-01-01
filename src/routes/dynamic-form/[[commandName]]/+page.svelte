<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { page, updated } from '$app/state';
	import { untrack } from 'svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { createSmartHandler } from '$lib/engine/events/event-handling';
	import {
		createClickHotKeyAttachment,
		createFocusHotKeyAttachment
	} from '$lib/engine/hotkeys/hotkey-actions';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import CommandBuilder from './CommandBuilder.svelte';
	import { goto } from '$app/navigation';
	import type { Page } from '@sveltejs/kit';
	import { createSyncableData, stampSyncableData } from '$lib/engine/storage/data/data';
	import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';
	import { loadCbState, saveCbState } from './command-builder-state-store';
	import type { Initializable } from '$lib/engine/types/utility-types';

	let justInitialized = true;
	let gCommandName = $state('DraftCommand');
	appState.pageContext.title = 'Command Builder';

	let isPermanentCommandPage = $state(false);
	let gSaveMessage = $derived(
		isPermanentCommandPage ? `Saving Command ${gCommandName}...` : `Saving Draft...`
	);

	let isSaving = $state(false);
	let gCbData: Initializable<CommandBuilderData> = $state({
		isInitialized: false,
		data: {
			commandStr: '',
			formData: {}
		}
	} as Initializable<CommandBuilderData>);

	function getPathWithoutParams(page: Page) {
		return page.route.id ? page.url.pathname.replace(/\/[^/]+$/, '') : page.url.pathname;
	}

	$effect(() => {
		track(page);

		untrack(async () => {
			await loadPageState(page);
			console.log('loaded page state', $state.snapshot(gCbData));
		});
	});

	$effect(() => {
		track(gCbData.data);
		untrack(async () => {
			if (justInitialized) {
				if (gCbData.isInitialized) {
					justInitialized = false;
				}
				return;
			}

			stampSyncableData(getDeviceId(), gCbData);
			console.log('Saving data', $state.snapshot(gCbData));
			saveCommandBuilderDataAutoHandler(null);
		});
	});

	async function loadPageState(page: Page) {
		let paramsCommandName = page.params.commandName;
		let loadedState: CommandBuilderData | undefined;

		if (paramsCommandName) {
			// PermanentCommandPage
			gCommandName = paramsCommandName;
			isPermanentCommandPage = true;
			let storedCommand = await loadCbState({
				kind: 'permanent',
				commandName: gCommandName
			});

			if (!storedCommand) {
				const redirectPath = getPathWithoutParams(page);
				console.warn(`CommandName [${paramsCommandName}] not found. Rerouting [${redirectPath}]`);

				goto(redirectPath, { replaceState: true });
			} else {
				loadedState = storedCommand;
			}
		} else {
			// Load Temporary Command
			loadedState = await loadCbState({
				kind: 'draft'
			});

			if (!loadedState?.data?.commandStr) {
				const exampleForm = getExampleCommand() as PermanentCommandBuilderState;
				exampleForm.commandName = gCommandName;
				loadedState = createSyncableData(getDeviceId(), exampleForm);
			}
		}

		if (!loadedState) throw new Error('Failed to Initialize Data');

		gCbData = {
			...loadedState,
			isInitialized: true
		};
	}

	function saveCommandBuilderData() {
		if (isPermanentCommandPage) {
			saveCbState({ kind: 'permanent', data: gCbData });
		} else {
			saveCbState({ kind: 'draft', data: gCbData });
		}

		isSaving = true;
		setTimeout(() => {
			isSaving = false;
		}, 1000);
	}

	let saveCommandBuilderDataAutoHandler = createSmartHandler(saveCommandBuilderData, {
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
		onclick={saveCommandBuilderData}
		{@attach createClickHotKeyAttachment('Save', 's', 'alt')}>Save</Button
	>
</div>

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
		top: var(--space-xs);
		right: var(--space-xs);
		transition: opacity 500ms;
	}

	:global(.button-save) {
		margin-top: var(--space-sm);
	}

	.show {
		opacity: 1;
	}

	.input-title {
		font-size: var(--font-size-4);
		padding: 0;
		margin-block-end: 4rem;
	}
</style>
