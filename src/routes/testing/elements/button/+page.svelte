<script lang="ts">
	import { createHotKeyTriggerClickAttachment } from '$lib/engine/engine-temp/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
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
			{@attach createHotKeyTriggerClickAttachment('', hotkey('p'))}
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
