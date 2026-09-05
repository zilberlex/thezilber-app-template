<script lang="ts">
	import { mergeProps } from 'svelte-toolbelt';

	let { children, ...rest } = $props();

	const mergedProps = $derived(mergeProps(rest));
</script>

<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...mergedProps}>
	{@render children()}
</svg>

<style>
	.icon {
		--_icon-bg: var(--icon-bg, var(--cl-bg));

		box-sizing: border-box;
		display: block;
		line-height: 1;

		--icon-color: currentColor;
		--_icon-stroke: var(--icon-stroke, var(--cl-primary));

		background-color: var(--_icon-bg);
		fill: var(--_icon-bg);

		stroke: var(--_icon-stroke);
		height: var(--icon-height);
		width: var(--icon-width);

		stroke-width: 2;

		border: var(--_icon-border-cl) solid 1px;
	}
</style>
