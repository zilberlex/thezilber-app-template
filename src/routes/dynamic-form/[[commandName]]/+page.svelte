<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import { loadState, saveState } from '$lib/engine/storage/local/local-storage-repository';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { createSmartHandler } from '$lib/engine/events/event-handling';
	import {
		createClickHotKeyAttachment,
		createFocusHotKeyAttachment
	} from '$lib/engine/hotkeys/hotkey-actions';
	import { appState } from '$lib/engine/state/application-state.svelte';

	import CommandBuilder from './CommandBuilder.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const DynamicFormStorageKey = 'DynamicForm';

	appState.pageContext.title = 'Dynamic Form';

	// Permanent Command
	let commandNameId = $state(data.commandName);
	let isPermanentPost = $derived(false);
	let isSaving = $state(false);

	let commandBuilderState: CommandBuilderState = $state({
		commandStr: '',
		formData: {}
	});

	function getPathWithoutParams(page: Page) {
		return page.route.id ? page.url.pathname.replace(/\/[^/]+$/, '') : page.url.pathname;
	}

	$effect(() => {
		pageLoad(page);
	});

	function pageLoad(page: Page) {
		let storedCommandName = page.params.commandName;

		// StoredState
		if (storedCommandName) {
			let storedCommand = getDynamicFormCommandByName(storedCommandName);

			if (!storedCommand) {
				const redirectPath = getPathWithoutParams(page);
				console.warn(`CommandName [${storedCommandName}] not found. Rerouting [${redirectPath}]`);

				goto(redirectPath, { replaceState: true });
			} else {
				commandBuilderState = storedCommand;
			}
		} else {
			// Load Temporary Command
			let dynamicFormTemporaryState = loadDynamicFormTemporaryState();
			if (dynamicFormTemporaryState?.commandStr) {
				commandBuilderState = dynamicFormTemporaryState;
			} else {
				// Load Example
				({ commandStr: commandBuilderState.commandStr, formData: commandBuilderState.formData } =
					loadExampleForm());
			}
		}
	}

	$effect(() => {
		track(commandBuilderState);
		untrack(() => {
			saveDynamicFormStateAutoHandler(null);
		});
	});

	function loadDynamicFormTemporaryState(): DynamicFormPageState | undefined {
		return loadState(DynamicFormStorageKey);
	}

	function saveDynamicForCommandBuilderState() {
		let dynamicFormState: CommandBuilderState = $state.snapshot(commandBuilderState);

		isSaving = true;
		setTimeout(() => {
			isSaving = false;
		}, 1000);

		saveState(DynamicFormStorageKey, dynamicFormState);
	}

	let saveDynamicFormStateAutoHandler = createSmartHandler(saveDynamicForCommandBuilderState, {
		cooldownDelay: 0,
		debounceDelay: 2000
	});

	function loadExampleForm(): CommandBuilderState {
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

	function getDynamicFormCommandByName(commandNameId: {}) {
		return undefined;
	}
</script>

<div class="save-indicator" class:show={isSaving}>Saving...</div>

<div class="mini-app">
	{#if isPermanentPost}
		<input
			bind:value={commandNameId}
			class="input-title"
			{@attach createFocusHotKeyAttachment('Modify Title', 'i', 'alt')}
		/>
	{/if}
	<CommandBuilder bind:commandBuilderState />
	<Button
		class="button-save"
		onclick={saveDynamicForCommandBuilderState}
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
