<script lang="ts">
	import { engineElementInteraction } from '$lib/engine/engine-hotkeys/engine-interactions';
	import { keyTriggerClick } from '$lib/packages/interactions';
	import { mergeProps } from 'svelte-toolbelt';

	let { children = undefined, thisNode = $bindable(), onkeydown: userOnKeydown = () => {}, ...rest } = $props();

	const onkeydown = keyTriggerClick(engineElementInteraction);

	const mergedProps = $derived(mergeProps({ onkeydown: userOnKeydown }, { onkeydown }, rest));
</script>

<button {...mergedProps} bind:this={thisNode}>
	{@render children?.()}
</button>
