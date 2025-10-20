<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource-variable/exo-2';
	import '@fontsource/audiowide';
	// Global import.
	import '$lib/ui/style/reset.css';
	import '$lib/ui/style/theme/theme.scss';

	let { children } = $props();

	const title = "Application List";
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
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
        @include ly-full-screen();
	}

	.header {
		line-height: 1;
		margin-top: 10px;

		display: flex;
		flex-direction: column;


		& > * {
			display: block;
		}

		.left {
			align-self: left;
		}

		.center {
			align-self: center;
			transform: translateY(-0.75lh);

			@media (width <= 750px) {
				transform: none;
				margin-top: var(--space-3);
			}
		}
	}

	.title {
		text-decoration: var(--cl-primary) underline;
	}

	.home-button {	
		& {
			--padding-inline-start: 0.5rem;
			--padding-block: 0.25rem;
			--padding-hover: calc(var(--padding-inline-start) + var(--hover-right-cut-x));
			--hover-right-cut-x: 1rem;
		}

		&::before {
			content: "|";
			color: var(--cl-primary);
		}
		
		&,
		&:hover,
		&:focus {
			all: unset;
			font-size: var(--font-size-lg);
			line-height: 1;
			padding-inline-start: 1rem;
			padding-block: 0.25rem;
			cursor: pointer;
			// font-family: "Audiowide";
			font-family: var(--font-accent);
			// font-family: "Orbitron";
			// font-family: "Unica One";
			// font-weight: bold;
		}

		&:hover, &:focus {
			animation: hover-button 1s forwards ;
		}

		@keyframes hover-button {
			0% {
				padding-inline-start: var(--padding-inline-start);
			}

			90% {
				padding-inline: var(--padding-hover);
			}

			99% {
				background-color: var(--cl-background);
				color: var(--cl-on-background);

				padding-inline: var(--padding-hover);
				clip-path: polygon(var(--hover-right-cut-x) 0, 
				100% 0, 
				calc(100% - var(--hover-right-cut-x)) 100%, 
				0 100%);
			}
			
			100% {
				padding-inline: var(--padding-hover);
				clip-path: polygon(0 0, 
				100% 0, 
				calc(100% - var(--hover-right-cut-x)) 100%, 
				0 100%);

				background-color: var(--cl-on-background);
				color: var(--cl-background);
			}
		}
	}

	@mixin hz-cover {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		inline-size: 100%;
		box-sizing: border-box;

		& > .left {
			box-sizing: border-box;
			justify-self: start;
		}
	
		& > .center {
			box-sizing: border-box;

			justify-self: center;	
		}
	
		& > .right {
			box-sizing: border-box;

			justify-self: right;	
		}
	}

	.page-container {
        @include ly-center();
		@include ly-fill-container();
    }
</style>