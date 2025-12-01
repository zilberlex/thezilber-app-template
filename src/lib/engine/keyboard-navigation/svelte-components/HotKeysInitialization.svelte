<script>
	import { onDestroy, onMount } from 'svelte';
	import { hotKeysModule } from '../../hotkeys/hotkey-module';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser) {
			hotKeysModule.init();
		}
	});

	onDestroy(() => {
		if (browser) {
			hotKeysModule.destroy();
		}
	});
</script>
