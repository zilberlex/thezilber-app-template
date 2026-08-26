<script lang="ts">
	import type { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';

	type Props = {
		preventedKeys: HotKey[];
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
