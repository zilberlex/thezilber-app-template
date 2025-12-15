<script lang="ts">
	let { children } = $props();
</script>

<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	{@render children()}
</svg>

<style>
	.icon {
		box-sizing: border-box;
		--height: 1em;
		--width: 1em;

		display: block;
		line-height: 1;

		--icon-stroke: var(--cl-primary);
		--icon-bg: var(--cl-bg);

		background-color: var(--icon-bg);
		fill: var(--icon-bg);

		stroke: var(--icon-stroke);
		height: var(--height);
		width: var(--width);

		stroke-width: 2;
	}
</style>
