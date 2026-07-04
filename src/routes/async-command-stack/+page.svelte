<script lang="ts">
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import ItemSlot from './ItemSlot.svelte';
	import { loadLocalState, saveLocalState } from '$lib/engine/storage/local/simple-state-persistance.svelte';
	import { copyState } from '$lib/engine/svelte-helpers/copy-state';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { type InsertCtx } from './app-actions/insert-pipline';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import type { PersistedCommandStack } from '$lib/engine/patterns/command/command-stack/command-stack';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/types';
	import { DemoCommandFactory } from './app-actions/demo-command-factory';
	import { createCommandRegistry } from './pipeline/command-registry';
	import type { DeleteCtx } from './app-actions/delete-pipeline';
	import type { ClearCtx } from './app-actions/clear-pipeline';

	let memoryStorage = new SvelteMap<string, string>();
	let farAwayStorage = new SvelteMap<string, string>();
	let inputKey = $state('');
	let inputValue = $state('');

	let commandRegistry = createCommandRegistry();
	let demoCommandFacotry = new DemoCommandFactory(commandRegistry, memoryStorage, farAwayStorage);

	const STORAGE_KEY = 'ASYNC_COMMAND_PAGE_STATE';

	async function saveState() {
		saveLocalState(STORAGE_KEY, { farAwayStorage, memoryStorage, inputKey, inputValue });
		saveCommandStack();
	}

	async function loadAppState() {
		const loaded = loadLocalState(STORAGE_KEY);

		copyState(loaded, {
			farAwayStorage,
			memoryStorage,
			inputKey: (val: any) => (inputKey = val),
			inputValue: (val: any) => (inputValue = val)
		});
	}

	onMount(() => {
		loadAppState();
		loadCommandStack();
	});

	async function clearState() {
		let clearCtx = $state.snapshot<ClearCtx>({
			storageState: memoryStorage
		});

		let command = demoCommandFacotry.clearCommand(clearCtx);
		appState.commandStack?.push(command);
		let commandResult = await command.execute();

		console.log('Delete Command Result', commandResult);
	}

	function copyValues(key: any, value: any): void {
		inputKey = key;
		inputValue = value;
	}

	function undo(): any {
		appState.commandStack?.undo();
	}

	function redo(): any {
		appState.commandStack?.redo();
	}

	async function insertItem() {
		let prevValue = memoryStorage.get(inputKey);

		if (prevValue === inputValue) return;

		let insertCtx = $state.snapshot<InsertCtx>({
			key: inputKey,
			insertValue: inputValue,
			undoValue: prevValue
		});

		let command = demoCommandFacotry.insertCommand(insertCtx);
		appState.commandStack?.push(command);
		let commandResult = await command.execute();

		console.log('Insert Command Result', commandResult);
	}

	async function deleteItem() {
		let originalValue = memoryStorage.get(inputKey);

		if (originalValue === undefined) {
			return;
		}
		let deleteCtx = $state.snapshot<DeleteCtx>({
			key: inputKey,
			originalValue
		});

		let command = demoCommandFacotry.deleteCommand(deleteCtx);
		appState.commandStack?.push(command);
		let commandResult = await command.execute();

		console.log('Clear Command Result', commandResult);
	}

	function saveCommandStack() {
		let persistentStack = appState.commandStack?.persistStack();
		if (persistentStack) {
			saveLocalState('COMMANDS', persistentStack);
		} else {
			console.warn('SAVE No Command Stack Present');
		}
	}

	function loadCommandStack() {
		let persistentStack = loadLocalState<PersistedCommandStack>('COMMANDS');
		if (!persistentStack) {
			console.warn('LOAD no Command Stack Present');
			return;
		}

		appState.commandStack?.hydrate(persistentStack, commandRegistry);
	}
</script>

<div class="demo ly-center">
	<NavigationScope scopeName="asyncApp" navigationKeys={NavigationKeysConfigSets.Vertical}>
		<div class="main">
			<div class="remote storage-display">
				{#each farAwayStorage.entries() as [key, value] (key)}
					<ItemSlot {key} {value} onClickCopy={copyValues} style="--color: red" />
				{/each}
			</div>
			<div class="local storage-display">
				{#each memoryStorage.entries() as [key, value] (key)}
					<ItemSlot {key} {value} onClickCopy={copyValues} />
				{/each}
			</div>
			<form class="controls">
				<InputCombo
					type="text"
					bind:value={inputKey}
					hotkey={{
						hotkey: '1',
						tooltip: 'Focus Key'
					}}>Key</InputCombo
				>
				<InputCombo
					type="text"
					hotkey={{
						hotkey: '2',
						tooltip: 'Focus Value'
					}}
					bind:value={inputValue}>Value</InputCombo
				>
				<Button onclick={insertItem} {@attach createClickHotKeyAttachment('Insert', false, hotkey('a', 'alt'))}
					>Insert</Button
				>
				<Button onclick={saveState} {@attach createClickHotKeyAttachment('Save', false, hotkey('s', 'alt'))}
					>Save</Button
				>
				<Button onclick={clearState} {@attach createClickHotKeyAttachment('Clear', false, hotkey('r', 'alt'))}
					>Clear</Button
				>
				<Button onclick={() => deleteItem()} {@attach createClickHotKeyAttachment('Delete', false, hotkey('d', 'alt'))}
					>Delete</Button
				>
				<Button onclick={() => undo()} {@attach createClickHotKeyAttachment('Undo', false, hotkey('z', 'ctrl|option'))}
					>Undo</Button
				>
				<Button
					onclick={() => redo()}
					{@attach createClickHotKeyAttachment('Redo', false, hotkey('z', 'ctrl|option', 'shift'))}>Redo</Button
				>
			</form>
		</div>
	</NavigationScope>
</div>

<style>
	.main {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.storage-display {
		height: 75px;
		border: var(--base-border-thick);
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
