<script lang="ts">
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/audiowide';
	// Global import.
	import '$lib/ui/style/reset.css';
	import '$lib/ui/style/theme/theme.scss';
	import { createFocusHotKeyAction } from '$lib/engine/hotkeys/hotkey-actions';
	import { resolve } from '$app/paths';
</script>

<div class="home-button-container">
	<a href={resolve('/')} class="home-button left" use:createFocusHotKeyAction={'h'}>Home</a>
</div>

<style lang="scss">
	@use '$lib/ui/style/utility/utility.scss' as *;

	.home-button-container {
		padding-block: 10px;
		display: inline-block;
		clip-path: polygon(0 0, 100% 0, calc(100% - var(--hover-right-cut-x)) 100%, 0 100%);

		& {
			--padding-inline-start: 1rem;
			--padding-block: 0.25rem;
			--padding-hover: calc(var(--padding-inline-start) + var(--hover-right-cut-x));
			--hover-right-cut-x: 1rem;
			--hover-right-cut-x-final: 1rem;
		}

		.home-button {
			&::before {
				content: '|';
				color: var(--cl-primary);
			}

			&,
			&:hover,
			&:focus {
				all: unset;
				font-size: var(--font-size-xl);
				line-height: 1;

				padding-inline-start: var(--padding-inline-start);
				padding-inline-end: calc(var(--padding-hover) * 2);
				cursor: pointer;
				font-family: var(--font-accent);

				transition: all 300ms ease-in-out;
			}

			&:hover,
			&:focus {
				background-color: var(--cl-on-background);
				color: var(--cl-background);

				padding-inline-start: var(--padding-hover);
			}
		}
	}
</style>
