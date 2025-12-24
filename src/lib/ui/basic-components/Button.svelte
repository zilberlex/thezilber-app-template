<script lang="ts">
	import {
		createEngineButtonClickOnKeyDownHandler,
		createEngineButtonOnClickHandler
	} from '$lib/engine/hotkeys/hotkey-handlers';
	import { mergeProps } from 'svelte-toolbelt';

	let {
		children = undefined,
		thisNode = $bindable(),
		onkeydown: userOnKeydown = () => {},
		onclick: userOnClick = () => {},
		...rest
	} = $props();

	const onkeyDown = createEngineButtonClickOnKeyDownHandler();
	const onClick = createEngineButtonOnClickHandler();

	const mergedProps = $derived(
		mergeProps(
			{ onkeydown: userOnKeydown, onclick: userOnClick },
			{ onkeydown: onkeyDown, onclick: onClick },
			rest
		)
	);
</script>

<button {...mergedProps} bind:this={thisNode}>
	{@render children?.()}
</button>
