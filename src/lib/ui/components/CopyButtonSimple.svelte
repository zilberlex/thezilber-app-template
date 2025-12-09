<script lang="ts">
	import CopyIcon from '$lib/assets/icons/CopyIcon.svelte';
	import IconButton from '../basic-components/IconButton.svelte';

	const { textToCopy, ...rest } = $props();

	function copyText() {
		navigator.clipboard.writeText(textToCopy);
	}
</script>

<IconButton onclick={copyText} {...rest}>
	<CopyIcon />
</IconButton>

<style>
	:global(button) {
		border: none;
		padding: 0;

		:global(& .icon) {
			--icon-stroke: red;
		}
	}
</style>
