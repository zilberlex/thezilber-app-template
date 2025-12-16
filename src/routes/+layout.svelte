<script lang="ts">
	import HomeButton from './HomeButton.svelte';

	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/audiowide';
	import '$lib/ui/style/reset.css';
	import '$lib/ui/style/theme/theme.scss';
	import AppInit from '$lib/app/AppInit.svelte';

	let { children } = $props();

	const title = 'Application List';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>
<AppInit />
<div class="app-container">
	<header class="header">
		<div>
			<HomeButton />
		</div>
		<h1 class="title center">{title}:</h1>
	</header>
	<main class="page-container">
		{@render children?.()}
	</main>
</div>

<style lang="scss">
	@use '$lib/ui/style/utility/utility.scss' as *;

	.app-container {
		min-height: 100vh;
		width: 100%;
		min-width: 350px;

		padding-top: 10px;

		display: flex;
		flex-direction: column;
	}

	.page-container {
		flex: 1 1 auto;
		@include ly-center();
	}

	.header {
		line-height: 1;

		display: flex;
		flex-direction: column;

		& > * {
			display: inline-block;
		}

		.center {
			align-self: center;
			transform: translateY(-50%);

			@media (width <= 750px) {
				transform: none;
				margin-top: var(--space-5);
			}
		}
	}

	.title {
		text-decoration: var(--cl-primary) underline;
	}
</style>
