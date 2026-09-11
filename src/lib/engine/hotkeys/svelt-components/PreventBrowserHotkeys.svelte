<script lang="ts">
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import type { KbKey } from '$lib/engine/keyboard-key/kb-key';

	type Props = {
		preventedKeys: KbKey[];
	};

	let { preventedKeys }: Props = $props();

	$effect(() => {
		const blankHandler = () => {};
		hotKeysModule.assignHotKeys(preventedKeys, blankHandler);

		return () => {
			hotKeysModule.removeHotKeys(preventedKeys, blankHandler);
		};
	});
</script>
