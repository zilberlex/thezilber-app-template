<script lang="ts">
	import Button from '$lib/ui/basic-components/Button.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	type Props = {
		startingState?: 'div' | 'button';
	} & HTMLAttributes<HTMLElement>;

	let { children = undefined, startingState = 'div', ...rest }: Props = $props();
	// svelte-ignore state_referenced_locally
	let isButton = $state(startingState === 'button');
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
