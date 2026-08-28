<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';

	let { toggle = $bindable(), children, ...rest } = $props();
</script>

<Button onclick={() => (toggle = !toggle)} {...rest}>
	{@render children?.()}
	{toggle ? '[On]' : '[Off]'}
</Button>
