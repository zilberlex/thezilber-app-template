<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { type DialogController } from './dialog-context.svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';

	type DialogProps = {
		open: boolean;
		dialogController: DialogController;
		children: Snippet;
	};

	let { open = $bindable(), dialogController, children }: DialogProps = $props();
	const propsId = $props.id();
	const thisDialogId = `dialog-${propsId}`;

	$effect(() => {
		if (open) {
			dialogController.openActiveDialog(thisDialogId, dialogBox);
		} else {
			dialogController.closeActiveDialog(thisDialogId);
		}
	});

	$effect(() => {
		track(dialogController);

		untrack(() => {
			if (dialogController.isOpen && dialogController.currentlyOpendId === thisDialogId) {
				open = dialogController.isOpen;
			} else {
				open = false;
			}
		});
	});
</script>

{#snippet dialogBox()}
	{@render children()}
{/snippet}
