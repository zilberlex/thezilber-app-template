<script lang="ts">
	let { children } = $props();
</script>

<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	{@render children()}
</svg>

<style>
	.icon {
		box-sizing: border-box;
		display: block;
		line-height: 1;

		--icon-stroke: var(--cl-primary);
		--icon-bg: var(--cl-bg);

		background-color: var(--icon-bg);
		fill: var(--icon-bg);

		stroke: var(--icon-stroke);
		height: var(--icon-height);
		width: var(--icon-width);

		stroke-width: 2;
	}
</style>
