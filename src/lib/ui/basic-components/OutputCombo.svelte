<script lang="ts">
	import type { Snippet } from 'svelte';

	type OutpuComboProps = {
		id: string;
		value?: any;
		children?: Snippet;
	};

	let { id, value, children }: OutpuComboProps = $props();
</script>

<output-combo>
	<label for="output">{@render children?.()}<span class="suffix">:</span></label>
	<output {id} class="ul-txt-primary">{value}</output>
</output-combo>

<style lang="scss">
	@use '$lib/ui/style/effects.scss' as *;

	output {
		@include pulse-text(var(--color-1), var(--color-1-bright));
	}
</style>
