<script lang="ts">
	import { createHotKeyTriggerClickAttachment } from '$lib/engine/engine-hotkeys/hotkey-actions';
	import { kbKey } from '$lib/packages/core/input/keyboard-key/kb-key-factories';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let state = $state(false);
</script>

<main class="ly-center">
	<div class="flex-col">
		<Button
			onclick={() => {
				state = !state;
				console.log('Clicked!');
			}}
			{@attach createHotKeyTriggerClickAttachment('', kbKey('p'))}
			tabindex="-1"
		>
			Hotkeyed button
		</Button>
		<Button onclick={() => (state = !state)}>click</Button>
		<div>
			{state ? 'On' : 'Off'}
		</div>
	</div>
</main>
