<script lang="ts">
	import { activeDialogController, activeDialogState } from './dialog-context.svelte';

	let { open = $bindable(), children } = $props();

	$effect(() => {
		if (open) {
			activeDialogController.openActiveDialog(dialogBox);
		} else {
			activeDialogController.closeActiveDialog(dialogBox);
		}
	});

	$effect(() => {
		open = activeDialogState.isOpen;
	});
</script>

{#snippet dialogBox()}
	{@render children()}
{/snippet}
