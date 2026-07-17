<script lang="ts">
	import { fadeAndSlide } from '$lib/engine/transitions/fade-and-slide';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import { restartableAnimationClass } from '$lib/engine/svelte-helpers/restartableAnimationClass.svelte';

	let {
		key,
		value,
		onClickCopy,
		...rest
	}: HTMLButtonAttributes & {
		key: any;
		value: any;
		onClickCopy?: (key: any, value: any) => void;
	} = $props();

	let transit = fadeAndSlide({ axis: 'x' });

	let prevKey: string | undefined = undefined;
	let prevValue: string | undefined = undefined;

	let animationClassHelperItem = restartableAnimationClass();
	let animationClassHelperKey = restartableAnimationClass();
	let animationClassHelperValue = restartableAnimationClass();

	$effect(() => {
		const currentKey = key;
		const currentValue = value;

		untrack(async () => {
			if (prevKey === currentKey && prevValue === currentValue) {
				return;
			}

			prevKey = currentKey;
			prevValue = currentValue;

			if (prevKey !== currentKey) {
				animationClassHelperKey.restartClass();
			}

			if (prevValue !== currentValue) {
				animationClassHelperValue.restartClass();
			}

			animationClassHelperItem.restartClass();
		});
	});
</script>

<button
	class={['item-display', animationClassHelperItem.active && 'item-change']}
	onclick={() => onClickCopy?.(key, value)}
	{...rest}
	transition:transit
	onanimationend={(e) => {
		if (e.animationName.includes('highlight-anim')) {
			animationClassHelperItem.deactivateClass();
		}
	}}
>
	<div class={['key', animationClassHelperKey.active && 'item-change']}>
		{key}
	</div>
	<div class={['value']}>
		{value}
	</div>
</button>

<style>
	.item-display {
		--_color: var(--color, var(--cl-primary));
		--_color-highlight: lch(from var(--_color) calc(l + 40) c h);

		display: flex;
		flex-direction: column;
		margin: 8px;
		align-items: center;

		&,
		& * {
			width: max-content;
			white-space: nowrap;
		}

		border: var(--border-thick) solid var(--_color);

		&:is(:hover, :focus-within) {
			border: var(--border-thick) solid var(--_color-highlight);
		}

		& .key {
			color: var(--cl-primary);
		}

		&.item-change {
			animation: 300ms ease-in-out highlight-anim;
		}
	}

	@keyframes highlight-anim {
		0% {
			border-color: var(--_color);
		}

		50% {
			border-color: var(--_color-highlight);
		}

		100% {
			border-color: var(--_color);
		}
	}
</style>
