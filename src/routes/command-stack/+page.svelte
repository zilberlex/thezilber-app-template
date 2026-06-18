<script lang="ts">
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { createCommand } from '$lib/engine/patterns/command/command-impl/create-command';
	import { appState } from '$lib/engine/state/application-state.svelte';

	let rngNumbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);

	let numbers = $state<number[]>([]);

	let numberProvider = (() => {
		let i = 0;
		return {
			generateNumber: () => {
				i = (i + 1) % rngNumbers.length;
				return rngNumbers[i++];
			},
			moveBack() {
				i = i - 1;
				i = i >= 0 ? i : rngNumbers.length - 1;
			}
		};
	})();

	let commandStack = $derived(appState.commandStack);

	function createCommandForNumberPush() {
		return createCommand(
			() => {
				let randomNum = numberProvider.generateNumber();
				numbers.push(randomNum);
			},
			() => {
				numberProvider.moveBack();
			}
		);
	}

	function onGenerateNumber() {
		commandStack?.execute(createCommandForNumberPush());
	}

	function onUndo() {
		commandStack?.undo();
	}
</script>

<div class="page">
	<div class="numbers">
		{#each numbers as number}
			<div>
				[{number}]
			</div>
		{/each}
	</div>
	<button
		onclick={() => onGenerateNumber()}
		{@attach createClickHotKeyAttachment('Generate Number', true, hotkey('a', 'alt'))}
	>
		Generate Number
	</button>
	<button onclick={() => onUndo()}> Undo </button>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		margin: 20px;
		gap: 8px;
	}

	button {
		width: 250px;
	}

	.numbers {
		display: flex;
		flex-direction: row;
		min-height: 48px;
		border: var(--base-border-thin);
		padding: 8px;
	}
</style>
