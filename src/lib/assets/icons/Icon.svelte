<script lang="ts">
	let { children } = $props();
</script>

<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	{@render children()}
</svg>

<style>
	.icon {
		--_icon-bg: var(--icon-bg, var(--cl-bg));

		box-sizing: border-box;
		display: block;
		line-height: 1;

		--icon-color: currentColor;
		--icon-stroke: var(--cl-primary);

		background-color: var(--_icon-bg);
		fill: var(--_icon-bg);

		stroke: var(--icon-stroke);
		height: var(--icon-height);
		width: var(--icon-width);

		stroke-width: 2;
	}
</style>
