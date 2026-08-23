<script lang="ts">
	import { markForNavigation } from '$lib/engine/keyboard-navigation/attachments';
	import { getNavigationManager } from '$lib/engine/keyboard-navigation/svelte-components/navigation-manager-provider.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { onMount } from 'svelte';

	import NavigatableAndUnnavigatableSwitcher from './NavigatableAndUnnavigatableSwitcher.svelte';
	import { browser } from '$app/environment';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';

	let navigationManager = getNavigationManager();
	onMount(() => {
		if (browser) {
			return navigationManager.assignScopeNavigationKeys([hotkey('t')], [hotkey('t', 'shift')]);
		}
	});
</script>

<main class="ly-center">
	<div class="container">
		<NavigationScope
			scopeName="unresolved-test"
			scopeOptions={{
				discoveryMode: 'marked',
				escapeMode: 'escape'
			}}
		>
			<div class="list">
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>A</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>B</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>C</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>D</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>F</NavigatableAndUnnavigatableSwitcher>
			</div>
		</NavigationScope>
		<NavigationScope
			scopeName="unresolved-test-2"
			scopeOptions={{
				discoveryMode: 'marked',
				escapeMode: 'escape'
			}}
		>
			<div class="list">
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>A</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>B</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>C</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>D</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation}>F</NavigatableAndUnnavigatableSwitcher>
			</div>
		</NavigationScope>
	</div>
</main>

<style>
	.container {
		display: flex;
		flex-direction: row;
		gap: var(--space-6);
	}

	.list {
		display: flex;
		gap: var(--space-4);
		flex-direction: column;
	}
</style>
