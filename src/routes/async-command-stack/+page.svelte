<script lang="ts">
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { onDestroy, onMount } from 'svelte';
	import { loadLocalState, saveLocalState } from '$lib/engine/storage/local/simple-state-persistance.svelte';
	import { copyState } from '$lib/engine/svelte-helpers/copy-state';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/types';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import ItemSlot from './ItemSlot.svelte';
	import Portal from '$lib/ui/components/portal/Portal.svelte';
	import LogViewer from '$lib/ui/components/logging/LogViewer.svelte';
	import AnchoredRegion from '$lib/ui/components/layout/AnchoredRegion.svelte';
	import { DemoManager } from './demo-manager.svelte';
	import { loadCommandStack, saveCommandStack } from '$lib/engine/state/command-state';
	import { beforeNavigate } from '$app/navigation';

	let inputKey = $state('');
	let inputValue = $state('');

	let demoAppManager = new DemoManager(appState.logger, appState.commandRegistry);

	const STORAGE_KEY = 'ASYNC_COMMAND_PAGE_STATE';

	async function saveState() {
		saveLocalState(STORAGE_KEY, {
			farAwayStorage: demoAppManager?.farAwayStorage,
			memoryStorage: demoAppManager?.memoryStorage,
			inputKey,
			inputValue
		});
	}

	async function loadAppState() {
		const loaded = loadLocalState(STORAGE_KEY);

		copyState(loaded, {
			farAwayStorage: demoAppManager.farAwayStorage,
			memoryStorage: demoAppManager.memoryStorage,
			inputKey: (val: any) => (inputKey = val),
			inputValue: (val: any) => (inputValue = val)
		});
	}

	onMount(() => {
		appState.loadApp('AsyncCommandStackDemo');
		loadAppState();
	});

	beforeNavigate(() => {
		saveState();
		appState.unloadApp();
	});

	function copyValues(key: any, value: any): void {
		inputKey = key;
		inputValue = value;
	}

	function undo(): any {
		appState.commandStack.undo();
	}

	function redo(): any {
		appState.commandStack.redo();
	}

	function insertItem() {
		demoAppManager.insertItem(inputKey, inputValue);
	}
	function updateItem() {
		demoAppManager.updateItem(inputKey, inputValue);
	}
	function deleteItem() {
		demoAppManager.deleteItem(inputKey);
	}
	function clearState() {
		demoAppManager.clearState();
	}
</script>

<div class="demo ly-center">
	<NavigationScope scopeName="asyncApp" navigationKeys={NavigationKeysConfigSets.Vertical}>
		<div class="main">
			<div class="remote storage-display content-surface">
				{#each demoAppManager.farAwayStorage.entries() as [key, value] (key)}
					<ItemSlot {key} {value} onClickCopy={copyValues} style="--color: red" />
				{/each}
			</div>
			<div class="local storage-display content-surface">
				{#each demoAppManager.memoryStorage.entries() as [key, value] (key)}
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
					}}
				>
					Key
				</InputCombo>
				<InputCombo
					type="text"
					hotkey={{
						hotkey: '2',
						tooltip: 'Focus Value'
					}}
					bind:value={inputValue}
				>
					Value
				</InputCombo>
				<Button onclick={insertItem} {@attach createClickHotKeyAttachment('Insert', false, hotkey('a', 'alt'))}>
					Insert
				</Button>
				<Button onclick={updateItem} {@attach createClickHotKeyAttachment('Update', false, hotkey('u', 'alt'))}>
					Update
				</Button>
				<Button onclick={clearState} {@attach createClickHotKeyAttachment('Clear', false, hotkey('r', 'alt'))}>
					Clear
				</Button>
				<Button onclick={deleteItem} {@attach createClickHotKeyAttachment('Delete', false, hotkey('d', 'alt'))}>
					Delete
				</Button>
				<Button onclick={() => undo()} {@attach createClickHotKeyAttachment('Undo', false, hotkey('z', 'ctrl|option'))}>
					Undo
				</Button>
				<Button
					onclick={() => redo()}
					{@attach createClickHotKeyAttachment('Redo', false, hotkey('z', 'ctrl|option', 'shift'))}
				>
					Redo
				</Button>
			</form>
		</div>
	</NavigationScope>
</div>

<Portal targetLayer="application-layer">
	<AnchoredRegion top="var(--space-2)" right="var(--space-2)" bottom="var(--space-2)" alignX="stretch" alignY="bottom">
		<LogViewer logger={appState.logger} direction="forward" />
	</AnchoredRegion>
</Portal>

<style lang="scss">
	.main {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.storage-display {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: var(--space-1);
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
