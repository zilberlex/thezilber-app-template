<script>
	import myPicBigDither from '$lib/assets/images/big-dither.jpg';
	import myPicSmallDither from '$lib/assets/images/small-dither.jpg';
</script>

<svelte:head>
	<title>About | The Zilber's Blog</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container">
	<div class="content split">
		<div class="left">
			<div class="portrait-container">
				<img class="portrait" src={myPicSmallDither} alt="Picutre of Yours Truely" width="400" height="500" />
				<img
					class="portrait hover-portrait"
					src={myPicBigDither}
					alt="Picutre of Yours Truly"
					width="400"
					height="500"
				/>
				<div class="color-overlay"></div>
			</div>
		</div>
		<div class="right">
			<h1>About Me:</h1>
			<p>
				Worked for 4.5 years as a backend Developer for a cybersecurity company - <em>Varonis Systems</em>, Inc. Mostly
				worked in creating streamlined data processing flows over Big Data.
			</p>

			<p>
				After negotiations with my employer to allow me a more nomadic lifestyle, we chose to peacefully part ways. I
				decided to learn front-end development in the persuit of developing cross-platform applications with beautiful
				UI's, I chose Svelte as my target framework for its promises and performance profile.
			</p>

			<p>
				After coding infrastructure and projects to various degrees of success, I reached to the point I am comfortable
				looking for work, while still developing my own projects. The new advancements in AI were nothing like I ever
				expected, and I decided to fully embrace agentic coding recently as I see how well it works and how quickly it
				gets the job done. With that being said, I am more than capable of having a hands down approach, and can pick up
				new technologies fast and independantly.
			</p>
		</div>
	</div>
</div>

<style>
	.email {
		color: var(--_color);
	}

	.container {
		--_color: var(--color, var(--cl-primary));

		--margin-top: 2rem;
		--min-margin-size: 10px;
		--max-width: 1200px;

		max-width: var(--max-width);
		margin: auto;
		margin-top: var(--margin-top);
		padding-inline: var(--min-margin-size);

		line-height: 1.5;
	}

	p {
		margin-block-end: 1rem;
	}

	.portrait-container {
		position: relative;
		display: inline-block;

		inline-size: min(100%, 400px); /* was: width: 400px */

		& .color-overlay {
			--inset: 20px;
			--hover-inset: 5px;

			position: absolute;
			inset: var(--inset);

			background-color: hsl(from var(--_color) h 35% l);

			mix-blend-mode: color;
			pointer-events: none;

			transition: inset 400ms steps(4);
		}

		&:is(:active, :hover, :focus) {
			& .hover-portrait {
				opacity: 1;
			}

			&:focus {
				outline: 2px solid var(--secondary-color);
			}

			& .color-overlay {
				inset: var(--hover-inset);
			}
		}
	}

	.portrait {
		display: block;
		inline-size: 100%;
		block-size: auto;

		pointer-events: none;

		margin: auto;

		filter: grayscale(100%) contrast(100%) brightness(100%);
	}

	.hover-portrait {
		opacity: 0;
		position: absolute;

		left: 0;
		top: 0;

		transition: opacity 400ms steps(4);
	}

	.hover-tooltip {
		position: absolute;
		left: -1ch;
		bottom: -0.5lh;
		padding-inline: 0.5rem;

		box-shadow: 2px -2px 4px rgb(0 0 0);

		border: 1px solid var(--secondary-color);
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: var(--_color);
	}

	.split {
		display: flex;
		flex-direction: row;
		gap: 2rem;
		align-items: flex-start;

		@media (width < 800px) {
			flex-direction: column;
			align-items: center;
		}
	}

	.left {
		flex: 0 0 auto;
	}

	.right {
		flex: 1 1 0;
		min-inline-size: 0;
	}
</style>
