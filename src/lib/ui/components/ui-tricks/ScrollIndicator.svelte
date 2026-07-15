<script>
	const { children } = $props();
	// Wrap the CHILDREN of a Scrollable Container

	// This requires to be in a container with a container-type: scroll-state
	// attaches to the edges of the current relatively positioner element.
</script>

<div class="scroll-indicator scroll-indicator-top"></div>
{@render children()}
<div class="scroll-indicator scroll-indicator-bottom"></div>

<style>
	.scroll-indicator {
		--indicator-color: var(--color, gray);

		--scroll-indicator-height: 20px;
		position: sticky;
		left: 0;
		right: 0;
		height: 0;

		pointer-events: none;

		opacity: 0;
		transition: all 0.5s ease-in-out;

		&::after {
			content: '';
			position: absolute;
			opacity: 1;
			height: var(--scroll-indicator-height);
			background-color: var(--indicator-color);

			inset-inline: 0;
			inset-block-end: 0;
		}

		&.scroll-indicator-top {
			top: var(--scroll-indicator-height);

			&::after {
				mask: linear-gradient(#0008 0%, #0000 60%, #0000 100%);
			}
		}

		&.scroll-indicator-bottom {
			bottom: 0;

			&::after {
				mask: linear-gradient(#0000 0%, #0000 40%, #0008 100%);
			}
		}
	}

	@container scroll-state(scrollable: top) {
		.scroll-indicator-top {
			opacity: 1;
		}
	}

	@container scroll-state(scrollable: bottom) {
		.scroll-indicator-bottom {
			opacity: 1;
		}
	}
</style>
