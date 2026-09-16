<script lang="ts">
	import {NavigationScope} from '$lib/packages/keyboard-navigation/svelte';
	import NavigatableAndUnnavigatableSwitcher from '../NavigatableAndUnnavigatableSwitcher.svelte';
	import { markForNavigation } from '$lib/packages/keyboard-navigation/svelte';
</script>

<main class="ly-center">
	<div class="container">
		<NavigationScope scopeId="unresolved-test" discoveryMode="marked" escapeMode="escape">
			<div class="list">
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>A</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>B</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>C</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>D</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>F</NavigatableAndUnnavigatableSwitcher>
			</div>
		</NavigationScope>
		<NavigationScope scopeId="unresolved-test-2" discoveryMode="marked" escapeMode="escape">
			<div class="list">
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>A</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>B</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>C</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>D</NavigatableAndUnnavigatableSwitcher>
				<NavigatableAndUnnavigatableSwitcher {@attach markForNavigation()}>F</NavigatableAndUnnavigatableSwitcher>
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
