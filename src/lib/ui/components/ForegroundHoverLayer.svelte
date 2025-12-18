<script lang="ts">
	const { children } = $props();
</script>

<div class="foreground-layer">
	{@render children()}
</div>

<style>
	.foreground-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}
</style>
