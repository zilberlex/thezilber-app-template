<script lang="ts">
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/audiowide';
	// Global import.
	import '$lib/ui/style/reset.css';
	import '$lib/ui/style/theme/theme.scss';

	let { children } = $props();

	const title = 'Application List';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>

<div class="app-container">
	<header class="header">
		<div>
			<a href="/" class="home-button left">Home</a>
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

		.left {
			align-self: left;
		}

		.center {
			align-self: center;
			// transform: translateY(-0.50lh);

			@media (width <= 750px) {
				transform: none;
				margin-top: var(--space-5);
			}
		}
	}

	.title {
		text-decoration: var(--cl-primary) underline;
	}

	.home-button {
		& {
			--padding-inline-start: 1rem;
			--padding-block: 0.25rem;
			--padding-hover: calc(var(--padding-inline-start) + var(--hover-right-cut-x));
			--hover-right-cut-x: 1rem;
			--hover-right-cut-x-final: 1rem;
		}

		&::before {
			content: '|';
			color: var(--cl-primary);
		}

		&,
		&:hover,
		&:focus {
			all: unset;
			font-size: var(--font-size-lg);
			line-height: 1;
			
			padding-inline-start: var(--padding-inline-start);
			padding-inline-end: calc(var(--padding-hover) * 2);
			cursor: pointer;
			font-family: var(--font-accent);

			transition: all 300ms ease-in-out;

			clip-path: polygon(0 0, 100% 0, calc(100% - var(--hover-right-cut-x)) 100%, 0 100%);
		}

		&:hover,
		&:focus {
			// animation: hover-button 0.3s forwards ease-in-out ;
			background-color: var(--cl-on-background);
			color: var(--cl-background);

			padding-inline-start: var(--padding-hover);
		}
	}
</style>
