<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import type { DialogController } from './dialog-contoller.svelte';

	type DialogProps = {
		open: boolean;
		dialogController: DialogController;
		children: Snippet;
	};

	let { open = $bindable(), dialogController, children }: DialogProps = $props();
	const propsId = $props.id();
	const thisDialogId = `dialog-${propsId}`;

	$effect(() => {
		track(open);

		untrack(() => {
			if (open) {
				dialogController.openDialog(thisDialogId, dialogBox);
			} else {
				dialogController.closeDialog(thisDialogId);
			}
		});
	});

	$effect(() => {
		track(dialogController);

		untrack(() => {
			if (dialogController.hasDialog(thisDialogId)) {
				open = true;
			} else {
				open = false;
			}
		});
	});
</script>

{#snippet dialogBox()}
	{@render children()}
{/snippet}
