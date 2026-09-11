<script lang="ts">
	import { onMount } from 'svelte';
	import { loadLocalState, saveLocalState } from '$lib/engine/storage/local/simple-state-persistance.svelte';
	import { copyState } from '$lib/engine/svelte-helpers/copy-state';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import ItemSlot from './ItemSlot.svelte';
	import Portal from '$lib/ui/components/portal/Portal.svelte';
	import LogViewer from '$lib/ui/components/logging/LogViewer.svelte';
	import AnchoredRegion from '$lib/ui/components/layout/AnchoredRegion.svelte';
	import { DemoManager } from './demo-manager.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/configurations';
	import { createHotKeyTriggerClickAttachment } from '$lib/engine/engine-hotkeys/hotkey-actions';
	import { kbKey } from '$lib/engine/keyboard-key/kb-key-factories';

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
	<NavigationScope scopeId="asyncApp" navigationKeys={NavigationKeysConfigSets.Vertical}>
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
				<Button onclick={insertItem} {@attach createHotKeyTriggerClickAttachment('Insert', kbKey('a', 'alt'))}>
					Insert
				</Button>
				<Button onclick={updateItem} {@attach createHotKeyTriggerClickAttachment('Update', kbKey('u', 'alt'))}>
					Update
				</Button>
				<Button onclick={clearState} {@attach createHotKeyTriggerClickAttachment('Clear', kbKey('r', 'alt'))}>
					Clear
				</Button>
				<Button onclick={deleteItem} {@attach createHotKeyTriggerClickAttachment('Delete', kbKey('d', 'alt'))}>
					Delete
				</Button>
				<Button onclick={() => undo()} {@attach createHotKeyTriggerClickAttachment('Undo', kbKey('z', 'ctrl|meta'))}>
					Undo
				</Button>
				<Button
					onclick={() => redo()}
					{@attach createHotKeyTriggerClickAttachment('Redo', kbKey('z', 'ctrl|meta', 'shift'))}
				>
					Redo
				</Button>
			</form>
		</div>
	</NavigationScope>
</div>

<Portal targetLayer="application-layer">
	<AnchoredRegion anchorX="end" anchorY="end" inset="var(--space-2)">
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
