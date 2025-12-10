<script lang="ts">
	let { children } = $props();
</script>

<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
	{@render children()}
</svg>

<style>
	.icon {
		display: block;
		line-height: 1;

		--icon-stroke: var(--cl-primary);
		--icon-bg: var(--cl-bg);

		background-color: var(--icon-bg);
		fill: var(--icon-bg);

		stroke: var(--icon-stroke);
		width: 1em;
		height: 1em;

		stroke-width: 1.5;
	}
</style>
