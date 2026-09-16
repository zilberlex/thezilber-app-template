<script lang="ts">
	import { engineElementInteraction } from '$lib/engine/engine-hotkeys/engine-interactions';
	import { keyTriggerClick } from '$lib/packages/interactions';
	import type { Snippet } from 'svelte';
	import { mergeProps } from 'svelte-toolbelt';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		thisNode?: HTMLButtonElement;
	} & HTMLButtonAttributes;

	let {
		children,
		thisNode = $bindable(),
		onkeydown: userOnKeydown = () => {},
		class: userClass = undefined,
		...rest
	}: Props = $props();

	const onkeydown = keyTriggerClick(engineElementInteraction);

	const mergedProps = $derived(mergeProps({ onkeydown: userOnKeydown }, { onkeydown }, rest));
</script>

<button {...mergedProps} bind:this={thisNode} class={['icon-button', userClass]}>
	{@render children()}
</button>

<style>
	.icon-button {
		border: none;
		padding: 0;

		--_stroke: var(--stroke, var(--cl-primary));
		--_bg: var(--bg, transparent);
		--_stroke-hover: var(--stroke-hover, var(--cl-primary));
		--_bg-hover: var(--bg-hover, var(--cl-primary-dimmer));
		--_bg-active: var(--bg-active, var(--cl-on-surface));

		background-color: var(--_bg);

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
			--icon-bg: var(--_bg);
			--icon-stroke: var(--_stroke);
			transition: inherit;
		}

		&:is(:hover, :focus-visible),
		&.btn-pressed {
			background-color: var(--_bg-hover);

			& :global(.icon) {
				--icon-bg: var(--_bg-hover);
				--icon-stroke: var(--_stroke-hover);
			}
		}

		&:active,
		&:global(.btn-start-work) {
			transition: none;
			background-color: var(--_bg-active);

			& :global(.icon) {
				--icon-bg: var(--_bg-active);
			}
		}
	}
</style>
