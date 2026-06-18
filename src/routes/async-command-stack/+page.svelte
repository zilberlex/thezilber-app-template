<script lang="ts">
	import { sleep } from '$lib/engine/general-js-ts/common';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import ItemSlot from './ItemSlot.svelte';
	import { loadLocalState, saveLocalState } from '$lib/engine/storage/local/simple-state-persistance.svelte';
	import { copyState } from '$lib/engine/svelte-helpers/copy-state';
	import { asyncCommand as constructAsyncCommand } from './AsyncCommand';
	import { appState } from '$lib/engine/state/application-state.svelte';

	let farAwayStorage = new SvelteMap<string, string>();
	let memoryStorage = new SvelteMap<string, string>();
	let inputKey = $state('');
	let inputValue = $state('');

	// let { farAwayStorage, memoryStorage, inputKey, inputValue } = appState;

	const STORAGE_KEY = 'ASYNC_COMMAND_PAGE_STATE';

	async function saveState() {
		saveLocalState(STORAGE_KEY, { farAwayStorage, memoryStorage, inputKey, inputValue });
	}

	async function loadAppState() {
		const loaded = loadLocalState(STORAGE_KEY);

		copyState(loaded, {
			farAwayStorage,
			memoryStorage,
			inputKey: (val: any) => (inputValue = val),
			inputValue: (val: any) => (inputValue = val)
		});
	}

	onMount(() => {
		loadAppState();
	});

	async function insertToFarAwayCommand(key: string, value: string, lazyUndoParams: () => { prevValue?: string }) {
		return {
			executeAsync: async () => {
				await sleep(3000);
				farAwayStorage.set(key, value);

				return 'Yay';
			},
			undoAsync: async () => {
				let { prevValue } = lazyUndoParams();
				await sleep(3000);
				if (!prevValue) {
					farAwayStorage.delete(key);
				} else {
					farAwayStorage.set(key, prevValue);
				}
			}
		};
	}

	async function deleteFromFarAwayStorage(key: string) {
		await sleep(3000);
		farAwayStorage.delete(key);
	}

	function insertOptimisticUndoPattern(key: string, value: string) {
		let prevValue: string | undefined;

		let lazyUndoPrams = () => {
			return {
				prevValue
			};
		};

		return {
			lazyUndoPrams,
			execute: () => {
				prevValue = memoryStorage.get(key);

				memoryStorage.set(key, value);
				return value;
			},
			undo: () => {
				console.log('Undoing Optimistic insert ', { key, value });
				if (!prevValue) {
					memoryStorage.delete(key);
				} else {
					memoryStorage.set(key, prevValue);
				}
			}
		};
	}

	async function deleteItem() {
		memoryStorage.delete(inputKey);
		await deleteFromFarAwayStorage(inputKey);
	}

	async function insert() {
		let [key, val] = [inputKey, inputValue];

		let optimisticUndoPattern = insertOptimisticUndoPattern(key, val);
		let asyncUndoPattern = await insertToFarAwayCommand(key, val, optimisticUndoPattern.lazyUndoPrams);

		let asyncCommand = constructAsyncCommand(optimisticUndoPattern, asyncUndoPattern);
		appState.commandStack?.push(asyncCommand);

		return await asyncCommand.execute();
	}

	async function insertCompleteFlow() {
		console.log(await insert());
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
		console.log('Undo');
		appState.commandStack?.undo();
	}

	function redo(): any {
		console.log('Redo');
		appState.commandStack?.redo();
	}
</script>

<div class="demo ly-center">
	<div class="main">
		<div class="remote storage-display">
			{#each farAwayStorage.entries() as [key, value]}
				<ItemSlot {key} {value} onClickCopy={copyValues} style="--cl-primary: #FF0000" />
			{/each}
		</div>
		<div class="local storage-display">
			{#each memoryStorage.entries() as [key, value]}
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
			<button onclick={insertCompleteFlow} {@attach createClickHotKeyAttachment('Insert', false, hotkey('a', 'alt'))}
				>Insert</button
			>
			<button onclick={saveState} {@attach createClickHotKeyAttachment('Save', false, hotkey('s', 'alt'))}>Save</button>
			<button onclick={clearSate} {@attach createClickHotKeyAttachment('Clear', false, hotkey('c', 'alt'))}
				>Clear</button
			>
			<button onclick={() => deleteItem()} {@attach createClickHotKeyAttachment('Delete', false, hotkey('d', 'alt'))}
				>Delete</button
			>
			<button onclick={() => undo()} {@attach createClickHotKeyAttachment('Undo', false, hotkey('z', 'ctrl|option'))}
				>Undo</button
			>
			<button
				onclick={() => redo()}
				{@attach createClickHotKeyAttachment('Redo', false, hotkey('z', 'ctrl|option', 'shift'))}>Redo</button
			>
		</form>
	</div>
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
