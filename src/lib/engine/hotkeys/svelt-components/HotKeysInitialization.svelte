<script>
	import { onDestroy } from 'svelte';
	import { hotKeysModule } from '../hotkey-module';
	import { browser } from '$app/environment';

	if (browser) {
		hotKeysModule.init();
	}

	onDestroy(() => {
		if (browser) {
			hotKeysModule.destroy();
		}
	});
</script>
