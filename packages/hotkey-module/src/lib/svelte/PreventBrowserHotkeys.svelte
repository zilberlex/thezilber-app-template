<script lang="ts">
	import { hotKeysModule } from '../hotkey-manager';
	import type { KbKey } from '@svelte-ascend/core';

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
