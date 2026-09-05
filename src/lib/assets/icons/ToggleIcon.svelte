<script>
	import Icon from './Icon.svelte';
	let { ...rest } = $props();
</script>

<Icon {...rest}>
	<path d="m5 12 4 4L19 6" />
</Icon>
