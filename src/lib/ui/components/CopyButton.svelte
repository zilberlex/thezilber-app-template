<script lang="ts">
	import CopyIconSvg from '$lib/assets/icons/CopyIconSvg.svelte';
	import type { Command } from '$lib/engine/patterns/command/command';
	import { createChangeElementTextContentTemporaryCommand } from '$lib/engine/patterns/command/command-impl/change-element-content-command';
	import Button from '$lib/ui/basic-components/Button.svelte';

	const {
		nodeToCopy,
		buttonText = 'Copy',
		tempTextAtCopy = 'Copied to Clipboard...',
		durationOfTempTextMs = 1000
	} = $props();

	let thisNode = $state() as Element;
	let copyTextReplaceCommand: Command;
	$effect(() => {
		if (thisNode) {
			copyTextReplaceCommand = createChangeElementTextContentTemporaryCommand(
				thisNode,
				tempTextAtCopy,
				durationOfTempTextMs
			);
		}
	});

	function copyCode() {
		copyTextReplaceCommand.execute();
		navigator.clipboard.writeText(nodeToCopy.textContent);
	}
</script>

<Button class="copy-code-button" onclick={copyCode} bind:thisNode>
	<CopyIconSvg />
	{buttonText}
</Button>

<style>
	:global(.copy-code-button) {
		/* Works with Icons */
		display: flex;
		align-items: center;
		gap: 0.35em;
	}
</style>
