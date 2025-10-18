<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/jetbrains-mono';
	// Global import.
	import '$lib/ui/style/reset.css';
	import '$lib/ui/style/theme/theme.scss';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<div class="page-container">
	{@render children?.()}
</div>

<style lang="scss">
	@use '$lib/ui/style/utility/utility.scss' as *;
	
	.page-container {
        @include ly-full-screen();
        @include ly-center();
    }
</style>