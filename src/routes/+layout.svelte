<script lang="ts">
	import HomeButton from './HomeButton.svelte';

	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/audiowide';
	import '$lib/ui/style/reset.css';
	import '$lib/ui/style/theme/theme.scss';
	import AppInit from '$lib/app/AppInit.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onNavigate } from '$app/navigation';
	import AppNavigationManager from '$lib/engine/keyboard-navigation/svelte-components/AppNavigationManager.svelte';

	let { children } = $props();
	onNavigate(() => {
		appState.pageContext.title = '';
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>

<AppInit />

<AppNavigationManager>
	<div class="app-container">
		<header class="header">
			<div>
				<HomeButton />
			</div>
		</header>
		<main class="page-container">
			{@render children?.()}
		</main>
	</div>
</AppNavigationManager>

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
</style>
