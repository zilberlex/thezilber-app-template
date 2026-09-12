<script lang="ts">
	import { hotKeysModule } from '$lib/packages/hotkey-module/hotkey-manager';
	import type { KbKey } from '$lib/packages/core/input/keyboard-key/kb-key';

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
