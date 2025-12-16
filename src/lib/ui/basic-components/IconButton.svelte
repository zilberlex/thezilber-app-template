<script lang="ts">
	import {
		createEngineButtonClickOnKeyDownHandler,
		createEngineButtonOnClickHandler
	} from '$lib/engine/hotkeys/hotkey-handlers';
	import { mergeProps } from 'svelte-toolbelt';

	let {
		children,
		thisNode = $bindable(),
		onkeydown: userOnKeydown = () => {},
		onclick: userOnClick,
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

<button class="icon-button" {...mergedProps} bind:this={thisNode}>
	{@render children()}
</button>

<style>
	.icon-button {
		&,
		&:is(:hover, :focus-visible, :active) {
			&,
			&::before,
			&::after {
				transform: none;
				animation: none;
				filter: none;
			}
		}

		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;

		& :global(.icon) {
			--icon-stroke: var(--cl-primary);
			transition: inherit;
		}

		&:is(:hover, :focus-visible),
		&.btn-pressed {
			background-color: var(--cl-primary-dimmest);

			& :global(.icon) {
				--icon-bg: var(--cl-primary-dimmest);
			}
		}

		&:active,
		:global(&.btn-start-work) {
			transition: none;
			background-color: var(--cl-on-surface);

			& :global(.icon) {
				--icon-bg: var(--cl-on-surface);
			}
		}
	}
</style>
