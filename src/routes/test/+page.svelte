<script lang="ts">
	import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { AutoResetValue } from '$lib/ui/reactive-classes/autoResetValue.svelte';

	let autoResetVal = new AutoResetValue('cool', 2000);
	$effect(() => {
		console.log('changed', autoResetVal.value);
	});
</script>

<div class=".flex-col">
	<div>
		isShowing: {temporaryMessageState.isShowing}
	</div>
	<div>
		Value: {temporaryMessageState.message}
	</div>
	<Button
		onclick={() => (temporaryMessageState.message = 'Boom')}
		{@attach createClickHotKeyAttachment('Boom', 'b', 'alt')}
	>
		Make Value Boom
	</Button>
</div>
