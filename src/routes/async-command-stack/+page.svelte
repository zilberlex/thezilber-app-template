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
	import { constructInsertPipelineCommand, type InsertCtx } from './app-actions/insert-pipline';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import type { PersistentCommandStack } from '$lib/engine/patterns/command/command-stack/command-stack';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/types';
	import { CommandRegistry } from '$lib/engine/patterns/command/persistency/commandRegistry';
	import { DemoCommandFactory } from './app-actions/demo-command-factory';

	let memoryStorage = new SvelteMap<string, string>();
	let farAwayStorage = new SvelteMap<string, string>();
	let inputKey = $state('');
	let inputValue = $state('');

	let commandRegistry = new CommandRegistry();
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

	function deleteOptimisticUndoPattern(key: string) {
		let optimisiticDeleteExecuteResult: {
			executed: boolean;
			prevValue?: string;
		} = {
			executed: false,
			prevValue: undefined
		};
		return {
			optimisiticDeleteExecuteResult: () => optimisiticDeleteExecuteResult,
			execute: () => {
				optimisiticDeleteExecuteResult.prevValue = memoryStorage.get(key);

				if (memoryStorage.delete(key)) {
					optimisiticDeleteExecuteResult.executed = true;
				}

				return optimisiticDeleteExecuteResult;
			},
			undo: () => {
				let prevValue = optimisiticDeleteExecuteResult.prevValue;
				console.log('Undoing Optimistic Delete', { key, prevValue });
				if (prevValue) {
					memoryStorage.set(key, prevValue);
					optimisiticDeleteExecuteResult.executed = false;
				}
			}
		};
	}

	function deleteToFarAwayUndoPattern(
		key: string,
		optimisiticDeleteExecuteResult: () => { executed: boolean; prevValue?: string }
	) {
		return {
			executeAsync: async () => {
				let optExecResult = optimisiticDeleteExecuteResult();

				if (optExecResult.executed) {
					farAwayStorage.delete(key);

					return 'Deleted ' + { key };
				}

				return 'Did not Delete';
			},
			undoAsync: async () => {
				let { prevValue } = optimisiticDeleteExecuteResult();
				if (prevValue) {
					farAwayStorage.set(key, prevValue);
				}
			}
		};
	}

	async function deleteItem() {
		// let key = inputKey;
		//
		// let optimisticUndoPattern = deleteOptimisticUndoPattern(key);
		// let asyncUndoPattern = deleteToFarAwayUndoPattern(key, optimisticUndoPattern.optimisiticDeleteExecuteResult);
		//
		// let asyncCommand = constructAsyncCommand(optimisticUndoPattern, asyncUndoPattern);
		// appState.commandStack?.push(asyncCommand);
		//
		// return await asyncCommand.execute();
	}

	function clearSate() {
		memoryStorage.clear();
		farAwayStorage.clear();
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
		let insertCtx = $state.snapshot<InsertCtx>({
			key: inputKey,
			insertValue: inputValue,
			undoValue: memoryStorage.get(inputKey)
		});

		let command = demoCommandFacotry.insertCommand(insertCtx);
		appState.commandStack?.push(command);
		let commandResult = await command.execute();

		console.log('Insert Command Result', commandResult);
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
		let persistentStack = loadLocalState<PersistentCommandStack>('COMMANDS');
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
					<ItemSlot {key} {value} onClickCopy={copyValues} style="--color: #FF0000" />
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
				<Button onclick={clearSate} {@attach createClickHotKeyAttachment('Clear', false, hotkey('c', 'alt'))}
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
