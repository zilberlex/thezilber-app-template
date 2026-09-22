<script lang="ts">
	import NavigatableAndUnnavigatableSwitcher from '../NavigatableAndUnnavigatableSwitcher.svelte';
	import { markForNavigation, KeyboardNavigationScope } from '@svelte-ascend/keyboard-navigation/svelte';
</script>

<main class="ly-center">
	<div class="container">
		<KeyboardNavigationScope scopeId="unresolved-test" discoveryMode="marked" escapeMode="escape">
			<div class="list">
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>A</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>B</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>C</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>D</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>F</NavigatableAndUnnavigatableSwitcher>
			</div>
		</KeyboardNavigationScope>
		<KeyboardNavigationScope scopeId="unresolved-test-2" discoveryMode="marked" escapeMode="escape">
			<div class="list">
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>A</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>B</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>C</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>D</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>F</NavigatableAndUnnavigatableSwitcher>
			</div>
		</KeyboardNavigationScope>
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
