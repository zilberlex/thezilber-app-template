<script>
	import { appState } from '$lib/engine/state/application-state.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import Dialog from '$lib/ui/components/dialog/Dialog.svelte';

	let isDialogOpen = $state(false);
</script>

<div class="page-content box flex-col">
	This is page content.
	<Button onclick={() => (isDialogOpen = true)}>Open Dialog</Button>
	dialog status: {isDialogOpen}
</div>

<Dialog bind:open={isDialogOpen} dialogController={appState.dialogController}>
	<div class="dialog-box box flex-col">
		This is dialog-box.
		<Button onclick={() => (isDialogOpen = false)}>Close Dialog</Button>
	</div>
</Dialog>

<style>
	.page-content {
		min-height: 500px;
		min-width: 500px;
	}

	.dialog-box {
		height: 200px;
		width: 300;
		margin: auto;
	}

	.flex-col {
		gap: var(--space-8);
	}
</style>
