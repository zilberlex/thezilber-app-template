<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';

	let { children = undefined, ...rest } = $props();
	let isButton = $state(false);
</script>

<div class="switcher" {...rest}>
	{#if isButton}
		<Button onclick={() => (isButton = false)}>
			button - {@render children?.()}
		</Button>
	{:else}
		<!-- svelte-ignore a11y_mouse_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="content-surface" onmouseover={() => (isButton = true)}>
			Div (Hover to reset) - {@render children?.()}
		</div>
	{/if}
</div>
